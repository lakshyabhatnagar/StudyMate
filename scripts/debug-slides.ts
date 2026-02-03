// Debug slides data
// Run with: npx tsx scripts/debug-slides.ts

import 'dotenv/config';
import { db } from '../config/db';
import { chapterContentSlides, coursesTable } from '../config/schema';
import { eq, desc } from 'drizzle-orm';

async function debugSlidesData() {
  console.log('🔍 Debugging slides data...');
  
  try {
    // Get the most recent course
    const recentCourse = await db.select()
      .from(coursesTable)
      .orderBy(desc(coursesTable.createdAt))
      .limit(1);
    
    if (recentCourse.length === 0) {
      console.log('❌ No courses found');
      return;
    }
    
    const course = recentCourse[0];
    console.log(`🎓 Found recent course: ${course.courseName} (${course.courseId})`);
    
    // Get all slides for this course
    const slides = await db.select()
      .from(chapterContentSlides)
      .where(eq(chapterContentSlides.courseId, course.courseId))
      .orderBy(chapterContentSlides.slideIndex);
    
    console.log(`📊 Found ${slides.length} slides:`);
    
    slides.forEach((slide, index) => {
      console.log(`\n📄 Slide ${index + 1}:`);
      console.log(`  - slideId: ${slide.slideId}`);
      console.log(`  - slideIndex: ${slide.slideIndex}`);
      console.log(`  - chapterId: ${slide.chapterId}`);
      console.log(`  - audioFileName: ${slide.audioFileName}`);
      console.log(`  - audioFileUrl: ${slide.audioFileUrl ? 'Present' : 'Missing'}`);
      console.log(`  - audioFileUrl (first 80 chars): ${slide.audioFileUrl?.substring(0, 80)}...`);
      console.log(`  - html length: ${slide.html?.length || 0} chars`);
      console.log(`  - narration: ${slide.narration ? JSON.stringify(slide.narration).substring(0, 100) + '...' : 'Missing'}`);
      console.log(`  - revelData: ${slide.revelData ? JSON.stringify(slide.revelData) : 'Missing'}`);
      console.log(`  - caption: ${slide.caption ? 'Present' : 'Missing'}`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging slides:', error);
  }
}

debugSlidesData();