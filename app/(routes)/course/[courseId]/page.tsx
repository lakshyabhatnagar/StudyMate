"use client";

import React, { useEffect, useState } from "react";
import CourseInfoCard from "./_components/CourseInfoCard";
import axios from "axios";
import { useParams } from "next/navigation";
import { Course } from "@/type/CourseType";
import CourseChapters from "./_components/CourseChapters";

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
    const result = await axios.get(
      `/api/course?courseId=${encodeURIComponent(courseId!)}`
    );
    setCourseDetails(result.data);
  };

  return (
    <div className="flex flex-col items-center">
      <CourseInfoCard course={courseDetail} />
      <CourseChapters course={courseDetail} />
    </div>
  );
}

export default CoursePreview;
