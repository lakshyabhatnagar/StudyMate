import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 Checking Fonada account status...");
    
    if (!process.env.FONADA_API_KEY) {
      return NextResponse.json({ 
        error: "FONADA_API_KEY not found" 
      }, { status: 500 });
    }

    // Try to get account info or usage stats
    try {
      const accountResponse = await axios.get("https://api.fonada.ai/account", {
        headers: {
          'Authorization': `Bearer ${process.env.FONADA_API_KEY}`,
        },
        timeout: 10000,
      });
      
      return NextResponse.json({
        success: true,
        accountInfo: accountResponse.data,
        message: "Account info retrieved successfully"
      });
    } catch (accountError: any) {
      console.log("Account endpoint not available, trying usage endpoint...");
    }

    // Try usage endpoint
    try {
      const usageResponse = await axios.get("https://api.fonada.ai/usage", {
        headers: {
          'Authorization': `Bearer ${process.env.FONADA_API_KEY}`,
        },
        timeout: 10000,
      });
      
      return NextResponse.json({
        success: true,
        usageInfo: usageResponse.data,
        message: "Usage info retrieved successfully"
      });
    } catch (usageError: any) {
      console.log("Usage endpoint not available, trying simple health check...");
    }

    // Try a very minimal request to see current limits
    try {
      const testResponse = await axios.post(
        "https://api.fonada.ai/tts/generate-audio-large",
        {
          input: "test",
          voice: "Vaanee", 
          language: "English"
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.FONADA_API_KEY}`,
          },
          timeout: 5000, // Very short timeout
        }
      );

      return NextResponse.json({
        success: true,
        message: "Surprisingly, the TTS request worked!",
        status: testResponse.status
      });

    } catch (error: any) {
      // Decode the error response
      let decodedResponse = null;
      if (error.response?.data && Buffer.isBuffer(error.response.data)) {
        try {
          decodedResponse = JSON.parse(error.response.data.toString());
        } catch (parseError) {
          console.log("Could not parse error response");
        }
      }

      return NextResponse.json({
        success: false,
        error: "Still hitting limits",
        status: error.response?.status,
        message: error.message,
        decodedResponse: decodedResponse,
        recommendation: decodedResponse?.detail?.rate_period === "concurrent" 
          ? "Contact Fonada support - account has zombie requests that need manual clearing"
          : "Wait for rate limit to reset"
      });
    }

  } catch (error: any) {
    return NextResponse.json({
      error: "Account check failed",
      message: error.message
    }, { status: 500 });
  }
}