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


/* ---------- route ---------- */
export async function POST(req: NextRequest) {
  try {
    const { chapter, courseId } = await req.json();
    console.log("Generating video content for chapter:", chapter);

    /* ---------- REMOVED: Gemini call - using existing chapter data ---------- */
    // No more Gemini call here - we already have the chapter structure!
    
    // Use the chapter data directly to create slides from subContent
    const VideoContentJson = chapter.subContent.map((content: string, index: number) => ({
      slideId: `${chapter.chapterId}-slide-${index + 1}`,
      slideIndex: index + 1,
      title: chapter.chapterTitle,
      subtitle: content,
      audioFileName: `${chapter.chapterId}-${String(index + 1).padStart(2, '0')}.mp3`,
      narration: {
        fullText: `${chapter.chapterTitle}: ${content}. Let's explore this important concept in detail.`
      },
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${chapter.chapterTitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans antialiased text-white">
  <div class="relative w-[1280px] h-[720px] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 p-16 flex flex-col justify-between">
    <header class="absolute top-8 left-16 right-16 flex justify-between items-baseline text-lg font-light text-gray-400">
      <span class="text-xl font-semibold text-gray-200">StudyMate Course</span>
      <span>Chapter ${index + 1}</span>
    </header>
    <main class="flex-grow flex flex-col justify-center items-center text-center">
      <h1 class="text-6xl font-extrabold mb-4 text-white drop-shadow-lg">${chapter.chapterTitle}</h1>
      <h2 class="text-3xl font-light text-gray-300 mb-16">${content}</h2>
      <div class="space-y-8 max-w-4xl mx-auto text-left">
        <div class="p-6 bg-gray-700/50 backdrop-blur-sm rounded-lg shadow-xl" data-reveal="r1">
          <p class="text-xl font-medium text-cyan-400">${content}</p>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`,
      revelData: ["r1"]
    }));

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

      // Rate limiting: 2 seconds between requests
      if (i > 0) {
        console.log("⏳ Waiting 2 seconds between requests...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

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
        console.log(`✅ Audio ${i + 1} generated successfully`);
        
      } catch (error: any) {
        console.error(`❌ Failed to generate audio ${i + 1}:`, error);
        audioFileUrls.push("");
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
      
      if (i < audioFileUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    /* ---------- Database: save everything ---------- */
    console.log("💾 Saving to database...");
    
    // Delete existing slides for this chapter (this prevents duplicates)
    console.log(`🗑️ Clearing existing slides for chapter: ${chapter.chapterId}`);
    const deleteResult = await db
      .delete(chapterContentSlides)
      .where(
        and(
          eq(chapterContentSlides.courseId, courseId),
          eq(chapterContentSlides.chapterId, chapter.chapterId)
        )
      );
    console.log(`✅ Deleted old slides for chapter ${chapter.chapterId}`);
    
    for (let index = 0; index < VideoContentJson.length; index++) {
      const slide = VideoContentJson[index];
      // Use consistent slideId without timestamp to prevent duplicates
      const uniqueSlideId = `${chapter.chapterId}-slide-${index + 1}`;
      
      console.log(`💾 Inserting slide ${index + 1}/${VideoContentJson.length}:`, uniqueSlideId);
      
      await db.insert(chapterContentSlides).values({
        courseId: courseId,
        chapterId: chapter.chapterId,
        slideId: uniqueSlideId,
        slideIndex: slide.slideIndex || (index + 1),
        audioFileName: slide.audioFileName || `${chapter.chapterId}-${index + 1}.mp3`,
        narration: slide.narration || { fullText: "" },
        html: slide.html || "<p>No content available</p>",
        revelData: slide.revelData || [],
        caption: captionsArray?.[index] ?? null,
        audioFileUrl: audioFileUrls[index] ?? null,
      });
    }

    console.log("✅ VIDEO PIPELINE COMPLETE - NO REDUNDANT GEMINI CALLS!");

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
