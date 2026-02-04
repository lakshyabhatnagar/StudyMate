import React from 'react'
import { Course } from '@/type/CourseType';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dot } from 'lucide-react';
import { Player } from '@remotion/player'
import { CourseComposition } from './ChapterVideo';

type Props={
    course:Course|undefined
    durationsBySlideId: Record<string,number>|null;
}

function CourseChapters({course, durationsBySlideId}:Props) {

    const slides=course?.chapterContentSlide??[];
    
    const GetChapterDurationInFrame = (chapterId: string) => {
        if (!durationsBySlideId || !course) return 180; // 6 seconds fallback

        const playableSlides = course.chapterContentSlide.filter(
            (slide) =>
            slide.chapterId === chapterId &&
            slide.audioFileUrl &&
            slide.audioFileUrl.length > 0
        );

        if (playableSlides.length === 0) return 180; // 6 seconds fallback

        let total = 0;

        for (const slide of playableSlides) {
            const dur = durationsBySlideId[slide.slideId];

            // ⛔ absolutely forbid NaN and ensure we have a valid number
            if (typeof dur !== "number" || !Number.isFinite(dur) || dur <= 0) {
                total += 180; // 6s fallback
            } else {
                total += dur;
            }
        }

        const result = Math.max(1, total);
        
        // Final safety check - ensure result is never NaN
        return Number.isFinite(result) ? result : 180;
    };



  return (
    <div className='max-w-6xl -mt-5 p-10 border rounded-3xl shadow w-full
        bg-background/80 backdrop-blur
    '>
        <div className='flex justify-between items-center'>
            <h2 className='font-bold text-2xl'>Course Preview</h2>
            <h2 className='text-sm text-muted-foreground'>Chapters and Short Preview</h2>
        </div>


        <div className='mt-5 '>
            {course?.courseLayout?.chapters?.map((chapter, index) => (
                <Card className='mb-5' key={index}>
                    <CardHeader>
                        <div className='flex gap-3 items-center'>
                            <h2 className='p-2 bg-primary/40 inline-flex h-10 w-10 text-center rounded-2xl justify-center'>{index+1}</h2>
                        </div>
                        <CardTitle className='md:text-xl text-base'>
                            {chapter.chapterTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-2 gap-5'>
                            <div>
                                {chapter?.subContent?.map((content,index)=>(
                                    <div className='flex gap-2 items-center mt-2' key={index}>
                                        <Dot className='h-5 w-5 text-emerald-500'/>
                                        <h2>{content}</h2>
                                    </div>
                                ))}
                            </div>
                            <div className='overflow-hidden'>
                                {durationsBySlideId ? (
                                    <Player
                                        component={CourseComposition}
                                        inputProps={{
                                            slides: slides.filter((slide) => 
                                                slide.chapterId === chapter.chapterId && 
                                                slide.audioFileUrl && 
                                                slide.audioFileUrl.length > 0
                                            ),
                                            durationsBySlideId: durationsBySlideId,
                                        }}  
                                        durationInFrames={GetChapterDurationInFrame(chapter?.chapterId)}
                                        compositionWidth={1280}
                                        compositionHeight={720}
                                        fps={30}
                                        controls
                                        style={{
                                            width: '80%',
                                            height: '180px',
                                            aspectRatio:'16/9',
                                        }} 
                                    />
                                ) : (
                                    <div className="bg-gray-200 rounded-lg h-45 flex items-center justify-center">
                                        <p className="text-gray-500">Loading video...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))} 
        </div>
    </div>
  )
}

export default CourseChapters