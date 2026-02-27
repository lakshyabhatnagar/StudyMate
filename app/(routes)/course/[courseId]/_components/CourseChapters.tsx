import React, { useMemo } from 'react'
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

    // Deduplicate slides by slideId
    const slides = useMemo(() => {
        const raw = course?.chapterContentSlide ?? [];
        const seen = new Set<string>();
        return raw.filter((slide) => {
            if (seen.has(slide.slideId)) return false;
            seen.add(slide.slideId);
            return true;
        });
    }, [course?.chapterContentSlide]);
    
    const GetChapterDurationInFrame = (chapterId: string) => {
        if (!durationsBySlideId || !course) return 180; // 6 seconds fallback

        const playableSlides = course.chapterContentSlide.filter(
            (slide) =>
            slide.chapterId === chapterId &&
            slide.audioFileUrl &&
            slide.audioFileUrl.length > 0
        );

        if (playableSlides.length === 0) return 180; // 6 seconds fallback

        const GAP_SECONDS = 1;
        const GAP_FRAMES = Math.round(GAP_SECONDS * 30); // must match CourseComposition

        let total = 0;

        for (const slide of playableSlides) {
            const dur = durationsBySlideId[slide.slideId];

            if (typeof dur !== "number" || !Number.isFinite(dur) || dur <= 0) {
                total += 240; // 8s fallback (must match CourseComposition fallback)
            } else {
                total += dur;
            }
        }

        // Add gap frames between slides (same as CourseComposition does)
        if (playableSlides.length > 1) {
            total += (playableSlides.length - 1) * GAP_FRAMES;
        }

        const result = Math.max(1, total);
        
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
                                {(() => {
                                    const chapterSlides = slides.filter((slide) => 
                                        slide.chapterId === chapter.chapterId && 
                                        slide.audioFileUrl && 
                                        slide.audioFileUrl.length > 0
                                    );

                                    if (!durationsBySlideId) {
                                        return (
                                            <div className="bg-gray-200 rounded-lg h-[180px] flex items-center justify-center">
                                                <p className="text-gray-500">Loading video...</p>
                                            </div>
                                        );
                                    }

                                    if (chapterSlides.length === 0) {
                                        return (
                                            <div className="bg-gray-100 rounded-lg h-[180px] flex items-center justify-center">
                                                <p className="text-gray-400 text-sm text-center px-4">
                                                    No video generated yet.<br />Click "Generate Remaining Videos" above.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Player
                                            component={CourseComposition}
                                            inputProps={{
                                                slides: chapterSlides,
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
                                    );
                                })()}
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