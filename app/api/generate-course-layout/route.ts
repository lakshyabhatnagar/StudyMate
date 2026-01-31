import { NextRequest, NextResponse } from "next/server";
import { Generate_Video_Prompt } from "@/data/Prompt";
import { client } from "@/config/openai";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
export async function POST(req: NextRequest) {
  try {
    const { userInput, courseId, type } = await req.json();
    const user=await currentUser();

    if (!userInput) {
      return NextResponse.json(
        { error: "Missing userInput" },
        { status: 400 }
      );
    }

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: Generate_Video_Prompt },
        { role: "user", content: "Course topic is " + userInput }
      ],
    });

    const raw = response.choices[0].message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "Empty AI response" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI did not return valid JSON" },
        { status: 500 }
      );
    }
    const courseResult= await db.insert(coursesTable).values({
      courseId: courseId,
      courseName:userInput,
      userInput: userInput,
      type: type,
      courseLayout: parsed,
      userId: user?.primaryEmailAddress?.emailAddress||"" 
    }).returning();

    return NextResponse.json(courseResult[0]);
  } catch (err) {
    console.error("generate-course-layout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
