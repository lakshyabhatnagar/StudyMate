import { NextRequest, NextResponse } from "next/server";
import { Course_config_prompt } from "@/data/Prompt";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { genAI } from "@/config/gemini";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    console.log("=== Starting generate-course-layout API ===");
    const { userInput, courseId, type } = await req.json();
    console.log("Request data:", { userInput, courseId, type });
    
    const user = await currentUser();
    console.log("User:", user?.primaryEmailAddress?.emailAddress);

    if (!user?.primaryEmailAddress?.emailAddress) {
      console.log("❌ User not authenticated");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    console.log("✅ User authenticated:", user.primaryEmailAddress.emailAddress);

    const { has } = await auth();
    const isPaidUser = has({ plan: 'monthly' });
    console.log("User payment status:", { isPaidUser });
    
    if (!isPaidUser) {
      const userCoursesCount = await db.select().from(coursesTable)
        .where(eq(coursesTable.userId, user.primaryEmailAddress.emailAddress));
      
      console.log("Existing courses count:", userCoursesCount.length);
      
      if (userCoursesCount.length >= 2) {
        console.log("❌ User reached free plan limit");
        return NextResponse.json({ msg: 'Upgrade to a paid plan to create more courses.' });
      }
    }

    if (!userInput || !courseId || !type) {
      console.log("❌ Missing required fields:", { userInput: !!userInput, courseId: !!courseId, type: !!type });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🚀 Calling Gemini AI...");

    // === GEMINI AI ===
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", 
    });
    
    const aiResult = await model.generateContent(
      Course_config_prompt + "\n\nCourse topic is " + userInput
    );
    
    const raw = aiResult.response.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("🤖 Gemini response received, length:", raw?.length);
    

    if (!raw) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 422 }
      );
    }

    const cleaned = raw
      .trim()
      .replace(/^```json\s*\n?/, "")
      .replace(/^```\s*\n?/, "")
      .replace(/\n?\s*```$/, "")
      .replace(/```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Response:", raw);
      console.error("Cleaned JSON:", cleaned);
      return NextResponse.json(
        { error: "AI returned invalid JSON", details: cleaned },
        { status: 422 }
      );
    }

    const dbResult = await db
      .insert(coursesTable)
      .values({
        courseId,
        courseName: parsed.courseName,
        userInput,
        type,
        courseLayout: JSON.stringify(parsed),
        userId: user.primaryEmailAddress.emailAddress,
      })
      .returning();

    return NextResponse.json(dbResult[0]);

  } catch (err: any) {
    console.error("generate-course-layout error:", err);

    const status =
      err?.status ||
      err?.response?.status ||
      500;

    const message =
      err?.message ||
      "Internal server error";

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}