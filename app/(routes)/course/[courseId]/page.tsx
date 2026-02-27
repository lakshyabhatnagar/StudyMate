"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [generationProgress, setGenerationProgress] = useState(0);
  const isGeneratingRef = useRef(false); // ref to survive re-renders & strict mode

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
      
      // Check if first chapter already has slides
      const firstChapter = result?.data?.courseLayout?.chapters?.[0];
      const firstChapterHasSlides = result?.data?.chapterContentSlide?.some(
        (slide: any) => slide.chapterId === firstChapter?.chapterId
      );
      
      // Only generate video content if first chapter has no slides AND not already generating AND not skipping auto-generation
      if (!firstChapterHasSlides && !isGeneratingRef.current && !skipAutoGeneration && firstChapter) {
        console.log("🎬 No slides found for first chapter, generating video content...");
        GenerateVideoContent(result?.data);
      } else if (firstChapterHasSlides) {
        console.log("✅ First chapter already has slides, skipping video generation");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details", { id: loadingToast });
    }
  };

  const GenerateVideoContent = async (course: Course) => {
    // Prevent multiple simultaneous generations (ref survives strict mode double-fire)
    if (isGeneratingRef.current) {
      console.log("⚠️ Video generation already in progress, skipping...");
      return;
    }
    
    // Generate content for the first chapter only to avoid overwhelming the system
    if (course.courseLayout.chapters.length > 0) {
      isGeneratingRef.current = true;
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
        isGeneratingRef.current = false;
        setIsGeneratingVideo(false);
      }
    }
  };

  const GenerateAllChaptersVideo = async () => {
    if (!courseDetail || isGeneratingVideo) {
      toast.error("Please wait for current generation to complete");
      return;
    }

    setIsGeneratingVideo(true);
    setGenerationProgress(0);
    const totalChapters = courseDetail.courseLayout.chapters.length;
    let chaptersProcessed = 0;
    
    for (let i = 0; i < totalChapters; i++) {
      const chapter = courseDetail.courseLayout.chapters[i];
      
      // Check if this chapter already has slides
      const chapterHasSlides = courseDetail.chapterContentSlide?.some(
        (slide: any) => slide.chapterId === chapter.chapterId
      );

      if (chapterHasSlides) {
        console.log(`✅ Chapter ${i + 1} already has slides, skipping...`);
        chaptersProcessed++;
        setGenerationProgress(Math.round((chaptersProcessed / totalChapters) * 100));
        continue;
      }

      const toastLoad = toast.loading(`Generating Video Content for Chapter ${i + 1} of ${totalChapters}`);
      
      try {
        console.log(`🎬 Generating video for Chapter ${i + 1}: ${chapter.chapterTitle}`);
        const result = await axios.post("/api/generate-video-content", {
          chapter: chapter,
          courseId: courseDetail.courseId,
        });
        
        console.log(`✅ Generated Video Content for chapter ${i + 1}:`, result.data);
        toast.success(`Video content generated for Chapter ${i + 1}`, { id: toastLoad });
        
      } catch (error: any) {
        console.error(`❌ Error generating video content for chapter ${i + 1}:`, error);
        toast.error(`Failed to generate video for Chapter ${i + 1}: ${error.message}`, { id: toastLoad });
        // Continue with next chapter even if one fails
      }
      
      chaptersProcessed++;
      setGenerationProgress(Math.round((chaptersProcessed / totalChapters) * 100));
    }

    setIsGeneratingVideo(false);
    setGenerationProgress(0);
    
    // Refresh course data to show all new video content
    const refreshToast = toast.loading("Refreshing course data...");
    await GetCourseDetail(true);
    toast.success("All chapters processed!", { id: refreshToast });
  };

  const fps = 30;

  // Stable reference: only changes when courseDetail actually changes
  // Also deduplicates by slideId to prevent key collisions
  const slides = useMemo(() => {
    const raw = courseDetail?.chapterContentSlide ?? [];
    const seen = new Set<string>();
    return raw.filter((slide) => {
      if (seen.has(slide.slideId)) return false;
      seen.add(slide.slideId);
      return true;
    });
  }, [courseDetail]);

  const [durationsBySlideId, setDurationsBySlideId] = useState<Record<string, number> | null>(null);

  // Recompute durations whenever the slides array truly changes
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (slides.length === 0) {
        setDurationsBySlideId(null);
        return;
      }

      const entries = await Promise.all(
        slides.map(async (slide) => {
          try {
            if (!slide?.audioFileUrl || slide.audioFileUrl.length === 0) {
              return [slide.slideId, fps * 8] as const; // 8 seconds default for slides without audio
            }

            const audioData = await getAudioData(slide.audioFileUrl);
            const audioSec = audioData?.durationInSeconds ?? 0;

            if (!Number.isFinite(audioSec) || audioSec <= 0) {
              return [slide.slideId, fps * 8] as const;
            }

            const frames = Math.max(fps * 2, Math.ceil(audioSec * fps));
            return [slide.slideId, frames] as const;
          } catch (error) {
            console.error(`Failed to get audio data for slide ${slide.slideId}:`, error);
            return [slide.slideId, fps * 8] as const;
          }
        })
      );

      if (!cancelled) {
        const validDurations: Record<string, number> = {};
        for (const [key, value] of entries) {
          validDurations[key as string] =
            Number.isFinite(value) && (value as number) > 0
              ? (value as number)
              : fps * 8;
        }
        console.log("✅ Duration map computed for", Object.keys(validDurations).length, "slides");
        setDurationsBySlideId(validDurations);
      }
    };

    run().catch(console.error);
    return () => { cancelled = true; };
  }, [slides]);

  return (
    <div className="flex flex-col items-center">
      <CourseInfoCard course={courseDetail} durationsBySlideId={durationsBySlideId} />
      
      {/* Generate All Chapters Button */}
      {courseDetail && (
        <>
          {/* Show button only if there are chapters without slides */}
          {courseDetail.chapterContentSlide?.length < courseDetail.courseLayout.chapters.length * 2 && (
            <div className="my-4 w-full max-w-md">
              <div className="flex flex-col gap-2">
                {/* Progress Bar - shows when generating */}
                {isGeneratingVideo && (
                  <div className="w-full">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium inline-block text-[#3EACA3]">
                          Generating Videos
                        </span>
                        <span className="text-sm font-semibold inline-block text-[#3EACA3]">
                          {generationProgress}%
                        </span>
                      </div>
                      <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                        <div
                          style={{ width: `${generationProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#3EACA3] transition-all duration-500 rounded-full"
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Button */}
                <button
                  onClick={GenerateAllChaptersVideo}
                  disabled={isGeneratingVideo}
                  className={`w-full px-6 py-3 rounded-lg text-white transition-all ${
                    isGeneratingVideo 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#3EACA3] hover:bg-[#359991] shadow-md hover:shadow-lg'
                  }`}
                >
                  {isGeneratingVideo ? 'Generating Videos...' : 'Generate Remaining Videos'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      <CourseChapters course={courseDetail} durationsBySlideId={durationsBySlideId} />
    </div>
  );
}

export default CoursePreview;
