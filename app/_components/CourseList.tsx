"use client"
import { Course } from '@/type/CourseType';
import axios from 'axios'
import React, { useEffect, useState, useMemo } from 'react'
import CourseListCard from './CourseListCard';

function CourseList() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetCourseList();
  }, [])

  const GetCourseList = async () => {
    try {
      setLoading(true);
      const result = await axios.get('/api/course');
      
      // Ensure we always have an array
      const data = result.data;
      if (Array.isArray(data)) {
        setCourseList(data);
      } else {
        console.warn("API returned non-array data:", data);
        setCourseList([]);
      }
    } catch (error) {
      console.error("Failed to fetch course list:", error);
      // Set empty array on error for better UX
      setCourseList([]);
    } finally {
      setLoading(false);
    }
  }

  const memoizedCourseList = useMemo(() => {
    // Double-check that courseList is an array
    return Array.isArray(courseList) ? courseList : [];
  }, [courseList]);

  if (loading) {
    return (
      <div className='max-w-6xl mt-10'>
        <h2 className='font-bold text-2xl'>My Courses</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (memoizedCourseList?.length === 0) {
    return (
      <div className='max-w-6xl mt-10'>
        <h2 className='font-bold text-2xl'>My Courses</h2>
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-500">Create your first AI-powered course above!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mt-10'>
      <h2 className='font-bold text-2xl'>My Courses</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        {Array.isArray(memoizedCourseList) && memoizedCourseList.map((course, index) => (
          <CourseListCard courseItem={course} key={course.courseId || index} />
        ))}
      </div>
      {(!memoizedCourseList || memoizedCourseList.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No courses found. Create your first course!</p>
        </div>
      )}
    </div>
  )
}

export default CourseList