import { genAI } from "@/config/gemini";
import { Generate_Video_Prompt } from "@/data/Prompt";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/config/s3";
import { VideoSlidesDummy } from "@/data/Dummy";
import { db } from "@/config/db";
import { chapterContentSlides } from "@/config/schema";
import { and, eq } from "drizzle-orm";
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';


/* ---------- helper: safely extract JSON ---------- */

function extractJSON(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  if (
    firstBracket !== -1 &&
    lastBracket !== -1 &&
    (firstBrace === -1 || firstBracket < firstBrace)
  ) {
    return cleaned.slice(firstBracket, lastBracket + 1);
  }

  if (firstBrace !== -1 && lastBrace !== -1) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("No JSON found");
}


/* ---------- route ---------- */
export async function POST(req: NextRequest) {
  try {
    const { chapter,courseId } = await req.json();
    console.log("Generating video content for chapter:", chapter);

    /* ---------- Gemini: generate video JSON ---------- */
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Changed back - this was working correctly
    });

    const aiResult = await model.generateContent(
      Generate_Video_Prompt +
        "\n\nChapter Details are " +
        JSON.stringify(chapter)
    );

    const raw =
      aiResult.response.candidates?.[0]?.content?.parts?.[0]?.text;


    if (!raw) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 422 }
      );
    }

    let VideoContentJson;
    try {
      VideoContentJson = JSON.parse(extractJSON(raw));
    } catch {
      console.error("Invalid AI JSON:", raw);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 422 }
      );
    }
 
    /* ---------- ElevenLabs TTS: generate audio files ---------- */
    console.log("🎵 Starting audio generation with ElevenLabs...");
    
    // Verify API key is available
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY environment variable is not set");
    }
    console.log("✅ ElevenLabs API key found");
    
    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    
    const audioFileUrls: string[] = [];
    
    for (let i = 0; i < VideoContentJson.length; i++) {
      const slide = VideoContentJson[i];
      let narration = slide?.narration?.fullText ?? slide?.narration ?? "";
      
      if (!narration) {
        console.log(`⚠️ No narration for slide ${i + 1}, skipping audio generation`);
        audioFileUrls.push("");
        continue;
      }

      console.log(`🎵 Generating audio ${i + 1}/${VideoContentJson.length}...`);
      console.log(`📝 Narration text (${narration.length} chars):`, narration.substring(0, 100) + "...");

      // Rate limiting: ElevenLabs has generous limits, but still be conservative 
      if (i > 0) {
        console.log("⏳ Waiting 2 seconds between requests...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds between requests
      }

      try {
        const audio = await elevenlabs.textToSpeech.convert(
          'JBFqnCBsd6RMkjVDRZzb', // Default voice_id - you can change this
          {
            text: narration,
            modelId: 'eleven_multilingual_v2',
            outputFormat: 'mp3_44100_128',
          }
        );

        // Convert the audio stream to buffer
        const chunks: Uint8Array[] = [];
        const reader = audio.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }
        
        const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
        const fileName = VideoContentJson[i]?.audioFileName ?? `chapter-${i}-audio`;
        const audioUrl = await saveAudioToS3(audioBuffer, fileName);
        audioFileUrls.push(audioUrl);
        console.log(`✅ Audio ${i + 1} generated successfully`);
        
      } catch (error: any) {
        console.error(`❌ Failed to generate audio ${i + 1}:`, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
        
        if (error.response?.status === 429) {
          console.log("⏳ Rate limited, waiting 60 seconds before retry...");
          await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
          
          // Retry once
          try {
            const audio = await elevenlabs.textToSpeech.convert(
              'JBFqnCBsd6RMkjVDRZzb',
              {
                text: narration,
                modelId: 'eleven_multilingual_v2',
                outputFormat: 'mp3_44100_128',
              }
            );

            // Convert the audio stream to buffer
            const chunks: Uint8Array[] = [];
            const reader = audio.getReader();
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
              }
            } finally {
              reader.releaseLock();
            }
            
            const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
            const fileName = VideoContentJson[i]?.audioFileName ?? `chapter-${i}-audio`;
            const audioUrl = await saveAudioToS3(audioBuffer, fileName);
            audioFileUrls.push(audioUrl);
            console.log(`✅ Audio ${i + 1} generated successfully (retry)`);
            
          } catch (retryError) {
            console.error(`❌ Retry failed for audio ${i + 1}:`, retryError);
            audioFileUrls.push("");
          }
        } else {
          // For other errors, push empty string to maintain indexes
          audioFileUrls.push("");
        }
      }
    }

    /* ---------- AssemblyAI: generate captions ---------- */
    console.log("📝 Starting caption generation...");
    const captionsArray: any[] = [];
    
    for(let i = 0; i < audioFileUrls.length; i++){
      if (!audioFileUrls[i]) {
        console.log(`⚠️ No audio file for slide ${i + 1}, skipping caption generation`);
        captionsArray.push(null);
        continue;
      }
      
      console.log(`📝 Generating captions ${i + 1}/${audioFileUrls.length}...`);
      
      try {
        const captions = await GenerateCaptions(audioFileUrls[i]);
        console.log(`✅ Captions generated for audio ${i + 1}`);
        captionsArray.push(captions);
      } catch (error) {
        console.error(`❌ Failed to generate captions for audio ${i + 1}:`, error);
        captionsArray.push(null);
      }
      
      // Add delay between caption requests
      if (i < audioFileUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    /* ---------- Database: save everything ---------- */
    console.log("💾 Saving to database...");
    
    // Delete existing slides for this chapter once before inserting new ones
    await db
      .delete(chapterContentSlides)
      .where(
        and(
          eq(chapterContentSlides.courseId, courseId),
          eq(chapterContentSlides.chapterId, chapter.chapterId)
        )
      );
    
    // Insert all new slide data with guaranteed unique slideIds
    for (let index = 0; index < VideoContentJson.length; index++) {
      const slide = VideoContentJson[index];
      
      // Generate guaranteed unique slideId using timestamp and index
      const uniqueSlideId = `${chapter.chapterId}-slide-${index + 1}-${Date.now()}`;
      
      // Insert new slide data - ensuring all NOT NULL constraints are met
      await db.insert(chapterContentSlides).values({
        courseId: courseId,
        chapterId: chapter.chapterId,
        slideId: uniqueSlideId, // Guaranteed unique slideId
        slideIndex: slide.slideIndex || (index + 1), // Ensure slideIndex exists
        audioFileName: slide.audioFileName || `${chapter.chapterId}-${index + 1}.mp3`, // NOT NULL constraint
        narration: slide.narration || { fullText: "" }, // NOT NULL constraint - ensure JSON object
        html: slide.html || "<p>No content available</p>", // NOT NULL constraint
        revelData: slide.revelData || [], // NOT NULL constraint - ensure JSON array
        caption: captionsArray?.[index] ?? null, // Can be null
        audioFileUrl: audioFileUrls[index] ?? null, // Can be null
      });
    }

    /* ---------- response ---------- */
    console.log("✅ VIDEO PIPELINE COMPLETE", {
      slides: VideoContentJson.length,
      audio: audioFileUrls.length,
      captions: captionsArray.length,
    });

    return NextResponse.json({
      slides: VideoContentJson,
      audioFileUrls,
      captionsArray
    });
    
  } catch (err: any) {
    console.error("generate-video-content error:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}

/* ---------- S3 helper ---------- */
async function saveAudioToS3(
  audioBuffer: Buffer,
  fileName: string
) {
  const key = fileName.endsWith(".mp3") ? fileName : `${fileName}.mp3`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: audioBuffer,
      ContentType: "audio/mpeg",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com/v2";

export async function GenerateCaptions(audioUrl: string) {
  // 1️⃣ Create transcription job
  const createResponse = await axios.post(
    `${ASSEMBLYAI_BASE_URL}/transcript`,
    {
      audio_url: audioUrl,
      speech_models: ["universal"],
    },
    {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );

  const transcriptId = createResponse.data.id;
  const pollingEndpoint = `${ASSEMBLYAI_BASE_URL}/transcript/${transcriptId}`;

  // 2️⃣ Poll until completed
  const MAX_POLL_TIME_MS=5*60*1000;
  const startTime=Date.now();
  while (true) {
    if(Date.now()-startTime>MAX_POLL_TIME_MS){
      throw new Error("AssemblyAI transcription timed out");
    }
    const pollingResponse = await axios.get(pollingEndpoint, {
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY!,
      },
    });

    const result = pollingResponse.data;

    if (result.status === "completed") {
      return result.text; // final transcription
    }

    if (result.status === "error") {
      throw new Error(`AssemblyAI transcription failed: ${result.error}`);
    }

    // wait 3 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

/* ---------- ARCHIVED: Fonada Implementation ---------- */
/*
// Old Fonada TTS implementation - commented out for reference
// Had issues with concurrent request limits (40/40) causing hangs

const fonadaResult = await axios.post(
  "https://api.fonada.ai/tts/generate-audio-large",
  {
    input: narration,
    voice: "Vaanee", 
    language: "English",
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.FONADA_API_KEY}`,
    },
    responseType: "arraybuffer",
    timeout: 45000,
  }
);

// Issues encountered:
// - 40 concurrent request limit caused zombie requests
// - Rate limit: 10 per minute, 100 per hour, 1000 per day
// - Required 30+ second delays between requests
// - Account-wide concurrent limits not cleared by new API keys
*/
