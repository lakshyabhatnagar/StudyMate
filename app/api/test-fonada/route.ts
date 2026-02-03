import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Testing ElevenLabs API connection...");
    
    // Check if API key exists
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json({ 
        error: "ELEVENLABS_API_KEY not found in environment" 
      }, { status: 500 });
    }

    console.log("🔑 API Key found:", {
      prefix: process.env.ELEVENLABS_API_KEY.substring(0, 10),
      length: process.env.ELEVENLABS_API_KEY.length
    });

    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Test simple TTS call
    const audio = await elevenlabs.textToSpeech.convert(
      'JBFqnCBsd6RMkjVDRZzb', // Default voice
      {
        text: "Hello, this is a test of ElevenLabs TTS.",
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    );

    // Convert stream to buffer to get size
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

    console.log("✅ ElevenLabs test successful");
    
    return NextResponse.json({
      success: true,
      message: "ElevenLabs API is working correctly",
      audioSize: audioBuffer.length,
      provider: "ElevenLabs"
    });

  } catch (error: any) {
    console.error("❌ ElevenLabs test failed:", error);
    
    return NextResponse.json({
      error: "ElevenLabs API test failed",
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      isAxiosError: error.isAxiosError,
      code: error.code,
      provider: "ElevenLabs"
    }, { status: 500 });
  }
}