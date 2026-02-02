import { NextRequest, NextResponse } from "next/server";
import { Course_config_prompt } from "@/data/Prompt";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { genAI } from "@/config/gemini";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userInput, courseId, type } = await req.json();
    const user = await currentUser();

    const {has}=await auth();
    const isPaidUser = has({ plan: 'monthly' })
    
    if(!isPaidUser){
      const userCoursesCount=await db.select().from(coursesTable).where(eq(coursesTable?.userId,user?.primaryEmailAddress?.emailAddress as string));
      if(userCoursesCount?.length>=2){
        return NextResponse.json({ msg:'Upgrade to a paid plan to create more courses.'});
      }
    }

    if (!userInput || !courseId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
    });

    const aiResult = await model.generateContent(
    Course_config_prompt + "\n\nCourse topic is " + userInput
    );


    const raw =
      aiResult.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 422 }
      );
    }

    const cleaned = raw
      .trim()
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Invalid AI JSON:", raw);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
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
        userId: user?.primaryEmailAddress?.emailAddress ?? null,
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