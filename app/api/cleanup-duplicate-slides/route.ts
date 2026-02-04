import { db } from "@/config/db";
import { chapterContentSlides } from "@/config/schema";
import { sql, eq, and, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🧹 Starting duplicate slide cleanup...");

    // Get all slides
    const allSlides = await db.select().from(chapterContentSlides);
    console.log(`📊 Total slides in database: ${allSlides.length}`);

    // Group slides by slideId (should be unique)
    const slideIdGroups = new Map<string, typeof allSlides>();
    
    for (const slide of allSlides) {
      const key = slide.slideId;
      if (!slideIdGroups.has(key)) {
        slideIdGroups.set(key, []);
      }
      slideIdGroups.get(key)!.push(slide);
    }

    // Find duplicates and keep only the one with highest id
    const idsToDelete: number[] = [];
    let duplicateCount = 0;

    for (const [slideId, slides] of slideIdGroups) {
      if (slides.length > 1) {
        duplicateCount++;
        console.log(`🔍 Found ${slides.length} duplicates for slideId: ${slideId}`);
        
        // Sort by id descending, keep the first (highest id), delete rest
        slides.sort((a, b) => (b.id || 0) - (a.id || 0));
        const toDelete = slides.slice(1).map(s => s.id).filter((id): id is number => id !== null);
        idsToDelete.push(...toDelete);
      }
    }

    console.log(`� Found ${duplicateCount} duplicate groups`);
    console.log(`🗑️ Will delete ${idsToDelete.length} duplicate slides`);

    // Delete duplicates
    if (idsToDelete.length > 0) {
      for (const id of idsToDelete) {
        await db.delete(chapterContentSlides).where(eq(chapterContentSlides.id, id));
      }
      console.log("✅ Duplicate cleanup complete!");
    } else {
      console.log("✅ No duplicates found!");
    }

    return NextResponse.json({
      success: true,
      message: `Removed ${idsToDelete.length} duplicate slides`,
      duplicatesFound: duplicateCount,
      idsDeleted: idsToDelete.length,
      remainingSlides: allSlides.length - idsToDelete.length
    });
  } catch (error: any) {
    console.error("❌ Cleanup error:", error);
    return NextResponse.json(
      { error: error.message ?? "Failed to cleanup duplicates", stack: error.stack },
      { status: 500 }
    );
  }
}
