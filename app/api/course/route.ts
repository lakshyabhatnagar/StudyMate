import { db } from "@/config/db";
import { chapterContentSlides, coursesTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  
  try {
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "User not authenticated or email missing" },
        { status: 401 }
      );
    }

    if (!courseId) {
      try {
        const userCourses = await db.select().from(coursesTable) 
          .where(eq(coursesTable.userId, user.primaryEmailAddress.emailAddress))
          .orderBy(desc(coursesTable.createdAt));

        // Parse courseLayout for each course
        const parsedUserCourses = userCourses.map(course => {
          let parsedCourseLayout = course.courseLayout;
          if (typeof course.courseLayout === 'string') {
            try {
              parsedCourseLayout = JSON.parse(course.courseLayout);
            } catch (error) {
              console.error("Error parsing courseLayout for course:", course.courseId, error);
              parsedCourseLayout = null;
            }
          }
          
          return {
            ...course,
            courseLayout: parsedCourseLayout,
            createdAt: course.createdAt ? course.createdAt.toISOString() : null,
          };
        });

        return NextResponse.json(parsedUserCourses);
      } catch (dbError) {
        console.error("Database connection error (courses list):", dbError);
        // Return empty array instead of error for better UX
        return NextResponse.json([]);
      }
    }

    try {
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

      const chapterContentSlide = await db.select().from(chapterContentSlides)
        .where(eq(chapterContentSlides.courseId, courseId))
        .orderBy(chapterContentSlides.slideIndex); 

      const course = courses[0];

      // Parse courseLayout if it's a string
      let parsedCourseLayout = course.courseLayout;
      if (typeof course.courseLayout === 'string') {
        try {
          parsedCourseLayout = JSON.parse(course.courseLayout);
        } catch (error) {
          console.error("Error parsing courseLayout:", error);
          parsedCourseLayout = null;
        }
      }

      // normalize non-JSON fields
      return NextResponse.json({
        ...course,
        courseLayout: parsedCourseLayout,
        createdAt: course.createdAt
          ? course.createdAt.toISOString()
          : null,
        chapterContentSlide: chapterContentSlide
      });
    } catch (dbError) {
      console.error("Database connection error (single course):", dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Course API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
