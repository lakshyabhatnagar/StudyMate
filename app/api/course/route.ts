import { db } from "@/config/db";
import { chapterContentSlides, coursesTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  const user=await currentUser();

  if (!courseId) {
    const userCourses= await db.select().from(coursesTable) 
    .where(eq(coursesTable.userId, user?.primaryEmailAddress?.emailAddress as string))
    .orderBy(desc(coursesTable.createdAt));

    return NextResponse.json(userCourses);
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseId, courseId));

  if (courses.length === 0) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }

  const chapterContentSlide=await db.select().from(chapterContentSlides)
  .where(eq(chapterContentSlides?.courseId, courseId as string)); 

  const course = courses[0];

  // normalize non-JSON fields
  return NextResponse.json({
    ...course,
    createdAt: course.createdAt
      ? course.createdAt.toISOString()
      : null,
      chapterContentSlide:chapterContentSlide
  });
}
