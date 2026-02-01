"use client";

import React, { useEffect, useState } from "react";
import CourseInfoCard from "./_components/CourseInfoCard";
import axios from "axios";
import { useParams } from "next/navigation";
import { Course } from "@/type/CourseType";
import CourseChapters from "./_components/CourseChapters";
import { toast } from "sonner";

function CoursePreview() {
  const params = useParams();
  const courseId =
    typeof params.courseId === "string"
      ? params.courseId
      : params.courseId?.[0];

  const [courseDetail, setCourseDetails] = useState<Course>();

  useEffect(() => {
    if (courseId) {
      GetCourseDetail();
    }
  }, [courseId]);

  const GetCourseDetail = async () => {
    const loadingToast = toast.loading("Loading Course Details...");
    const result = await axios.get(
      `/api/course?courseId=${encodeURIComponent(courseId!)}`
    );
    setCourseDetails(result.data);
    toast.success("Course Details Loaded Successfully!",{id:loadingToast});
    if(result?.data?.chapterContentSlide?.length ===0){
      GenerateVideoContent(result?.data);
    }
  };

  const GenerateVideoContent = async (course: Course) => {
    for (let i = 0; i < course.courseLayout.chapters.length; i++) {
      if (i > 0) break;
      const toastLoad = toast.loading("Generating Video Content for Chapter "+(i+1));
      const result = await axios.post("/api/generate-video-content", {
        chapter: course?.courseLayout.chapters[0],
        courseId: course?.courseId,
      });
      console.log("Generated Video Content for chapter:", result.data);
      toast.success("Video content generated", { id: toastLoad });
    }
  };


  return (
    <div className="flex flex-col items-center">
      <CourseInfoCard course={courseDetail} />
      <CourseChapters course={courseDetail} />
    </div>
  );
}

export default CoursePreview;
