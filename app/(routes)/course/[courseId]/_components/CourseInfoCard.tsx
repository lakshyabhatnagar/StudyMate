import React, { useMemo } from 'react'
import { Course } from '@/type/CourseType';
import { BookOpen, ChartNoAxesColumnIncreasing, Sparkles } from 'lucide-react';
import { Player } from '@remotion/player';
import { CourseComposition } from './ChapterVideo';

type Props={
    course:Course|undefined
    durationsBySlideId: Record<string,number>|null;
}

function CourseInfoCard({course, durationsBySlideId}:Props) {
    const fps=30;
    
    const allSlides=course?.chapterContentSlide??[];

    // Only include slides that actually have audio, deduplicated by slideId
    const playableSlides = useMemo(() => {
        const seen = new Set<string>();
        return allSlides.filter(s => {
            if (!s.audioFileUrl || s.audioFileUrl.length === 0) return false;
            if (seen.has(s.slideId)) return false;
            seen.add(s.slideId);
            return true;
        });
    }, [allSlides]);

    const GAP_FRAMES = Math.round(1 * fps);

    const durationInFrames=useMemo(()=>{
        if(!durationsBySlideId || playableSlides.length === 0) {
            return playableSlides.length > 0
                ? playableSlides.length * fps * 8 + Math.max(0, playableSlides.length - 1) * GAP_FRAMES
                : fps * 8; // minimum fallback
        }
        
        const slideDuration = playableSlides.reduce((sum,slide)=> {
            const duration = durationsBySlideId[slide.slideId] ?? fps * 8;
            return sum + duration;
        }, 0);
        
        const gapsDuration = playableSlides.length > 1 ? (playableSlides.length - 1) * GAP_FRAMES : 0;
        const totalDuration = slideDuration + gapsDuration;
        
        return Math.max(fps * 2, totalDuration);
    },[durationsBySlideId,playableSlides,fps,GAP_FRAMES]);

    if(!course || playableSlides.length === 0){
        return <div className="text-white p-8">Loading course content...</div>
    }

  return (
    <div>
        <div className='p-8 grid grid-cols-1 md:grid-cols-2 gap-5 bg-gradient-to-br from-slate-50 via-slate-800 to-emerald-950'>
            <div>
                <h2 className='inline-flex gap-2 p-1 px-2 border rounded-2xl text-white border-gray-200/70'><Sparkles /> Course Preview</h2>
                <h2 className='text-5xl font-bold mt-4 text-white '>{course?.courseName}</h2>
                <p className='text-lg mt-3 text-white'>{course?.courseLayout?.courseDescription}</p>
                <div className='mt-5 flex gap-5'>
                    <h2 className='px-3 p-2 border rounded-3xl inline-flex gap-2 items-center text-white'><ChartNoAxesColumnIncreasing className='text-sky-400'/>{course?.courseLayout?.level}</h2>
                    <h2 className='px-3 p-2 border rounded-3xl inline-flex gap-2 items-center text-white'><BookOpen className='text-green-400'/>{course?.courseLayout?.totalChapters} Chapters </h2>
                </div>
            </div>
            <div className='border-2 border-white/10 rounded-2xl'>
                <Player
                    component={CourseComposition}
                    inputProps={{
                        slides: playableSlides,
                        durationsBySlideId: durationsBySlideId || {},
                    }} 
                    durationInFrames={durationInFrames || (playableSlides.length * fps * 8)}
                    compositionWidth={1280}
                    compositionHeight={720}
                    fps={30}
                    controls
                    style={{
                        width: '100%',
                        aspectRatio:'16/9',
                    }} 
                />
            </div>
        </div>
    </div>
  )
}

export default CourseInfoCard