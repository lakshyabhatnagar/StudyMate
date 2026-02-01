import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId missing" },
      { status: 400 }
    );
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

  const course = courses[0];

  // normalize non-JSON fields
  return NextResponse.json({
  ...course,
  createdAt: course.createdAt
    ? course.createdAt.toISOString()
    : null,
});
}
