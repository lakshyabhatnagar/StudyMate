"use client";

import React, { useEffect, useState } from "react";
import CourseInfoCard from "./_components/CourseInfoCard";
import axios from "axios";
import { useParams } from "next/navigation";
import { Course } from "@/type/CourseType";
import CourseChapters from "./_components/CourseChapters";
import { toast } from "sonner";
import { getAudioData } from "@remotion/media-utils";

function CoursePreview() {
  const params = useParams();
  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : params.courseId?.[0];

  const [courseDetail, setCourseDetails] = useState<Course>();
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  useEffect(() => {
    if (courseId) {
      GetCourseDetail();
    }
  }, [courseId]);

  const GetCourseDetail = async (skipAutoGeneration = false) => {
    const loadingToast = toast.loading("Loading Course Details...");
    try {
      const result = await axios.get(
        `/api/course?courseId=${encodeURIComponent(courseId!)}`
      );
      setCourseDetails(result.data);
      toast.success("Course Details Loaded Successfully!", { id: loadingToast });
      
      // Only generate video content if there are no existing slides AND not already generating AND not skipping auto-generation
      if (result?.data?.chapterContentSlide?.length === 0 && !isGeneratingVideo && !skipAutoGeneration) {
        GenerateVideoContent(result?.data);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details", { id: loadingToast });
    }
  };

  const GenerateVideoContent = async (course: Course) => {
    // Prevent multiple simultaneous generations
    if (isGeneratingVideo) {
      console.log("⚠️ Video generation already in progress, skipping...");
      return;
    }
    
    // Generate content for the first chapter only to avoid overwhelming the system
    if (course.courseLayout.chapters.length > 0) {
      setIsGeneratingVideo(true);
      const toastLoad = toast.loading("Generating Video Content for Chapter 1");
      try {
        const result = await axios.post("/api/generate-video-content", {
          chapter: course.courseLayout.chapters[0],
          courseId: course.courseId,
        });
        console.log("Generated Video Content for chapter:", result.data);
        toast.success("Video content generated for Chapter 1", { id: toastLoad });
        
        // Auto-refresh course data to show the new video content
        console.log("🔄 Refreshing course data to show video content...");
        await GetCourseDetail(true); // Skip auto-generation on refresh
        
      } catch (error) {
        console.error("Error generating video content:", error);
        toast.error("Failed to generate video content", { id: toastLoad });
      } finally {
        setIsGeneratingVideo(false);
      }
    }
  };
        const fps=30;
        const slides=courseDetail?.chapterContentSlide??[];
        const [durationsBySlideId, setDurationsBySlideId]=useState<Record<string,number>|null>(null);
    
        useEffect(()=>{
            let cancelled=false;
            const run=async()=>{
                if(!slides || slides.length === 0) return;
                
                const entries=await Promise.all(
                    slides.map(async(slide: any)=>{
                        try {
                            if (!slide?.audioFileUrl || slide.audioFileUrl.length === 0) {
                                return [slide.slideId, fps * 8] as const; // 8 seconds default
                            }
                            
                            const audioData = await getAudioData(slide.audioFileUrl);
                            const audioSec = audioData?.durationInSeconds ?? 0;
                            
                            // Ensure we have a valid number
                            if (!Number.isFinite(audioSec) || audioSec <= 0) {
                                return [slide.slideId, fps * 8] as const; // 8 seconds fallback
                            }
                            
                            const frames = Math.max(fps * 2, Math.ceil(audioSec * fps)); // Minimum 2 seconds
                            return [slide.slideId, frames] as const;
                        } catch (error) {
                            console.error(`Failed to get audio data for slide ${slide.slideId}:`, error);
                            return [slide.slideId, fps * 8] as const; // 8 seconds fallback
                        }
                    })
                );
                
                if(!cancelled){
                    const durationsObject = Object.fromEntries(entries);
                    // Double-check all values are valid numbers
                    const validDurations: Record<string, number> = {};
                    for (const [key, value] of Object.entries(durationsObject)) {
                        validDurations[key] = (Number.isFinite(value) && (value as number) > 0) 
                            ? (value as number) 
                            : fps * 8;
                    }
                    setDurationsBySlideId(validDurations);
                }
            };
            run().catch(console.error);
            return ()=>{cancelled=true;}
        },[slides,fps]);

  return (
    <div className="flex flex-col items-center">
      <CourseInfoCard course={courseDetail} durationsBySlideId={durationsBySlideId} />
      <CourseChapters course={courseDetail} durationsBySlideId={durationsBySlideId} />
    </div>
  );
}

export default CoursePreview;
