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
      model: "gemini-2.5-flash",
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
 
    /* ---------- Audio generation + S3 upload ---------- */
    let audioFileUrls: string[] = [];  

    for (let i = 0; i < VideoContentJson.length; i++) {     
      // if (i > 0) break; // testing guard

        let narration =
        VideoContentJson[i]?.narration?.fullText ?? "";
        const MAX_CHARS = 400;
        if (narration.length > MAX_CHARS) {
        narration = narration.slice(0, MAX_CHARS);
        }


      if (!narration) continue;

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
          timeout: 120000,
        }
      );

      const audioBuffer = Buffer.from(fonadaResult.data);

      const fileName =
        VideoContentJson[i]?.audioFileName ??
        `chapter-${i}-audio`;

      const audioUrl = await saveAudioToS3(
        audioBuffer,
        fileName
      );

      audioFileUrls.push(audioUrl);
    }                                   
    
    let captionsArray: any[]=[];
    for(let i=0;i<audioFileUrls.length;i++){
        const captions=await GenerateCaptions(audioFileUrls[i]);
        console.log("Captions for audio ",i,": ",captions);
        captionsArray.push(captions);
    }

    //Save everything to Database
        for (let index = 0; index < VideoContentJson.length; index++) {
        const slide = VideoContentJson[index];
        await db
        .delete(chapterContentSlides)
        .where(
          and(
            eq(chapterContentSlides.courseId, courseId),
            eq(chapterContentSlides.chapterId, chapter.chapterId)
          )
        );

        await db.insert(chapterContentSlides).values({
            courseId: courseId,
            chapterId: chapter.chapterId,
            slideId: slide.slideId,
            slideIndex: slide.slideIndex,
            audioFileName: slide.audioFileName,
            narration: slide.narration,
            html: slide.html,
            revelData: slide.revelData,
            caption: captionsArray?.[index] ?? null,
            audioFileUrl: audioFileUrls[index] ?? null,
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
