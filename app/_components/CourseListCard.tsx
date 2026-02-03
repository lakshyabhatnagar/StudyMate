import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Course } from '@/type/CourseType'
import { Calendar, Dot, Layers, Play } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import moment from 'moment'


type Props={
    courseItem:Course
}
function CourseListCard({courseItem}:Props) {
  return(
        <Card className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200">
            <CardHeader className="space-y-3">
                {/* Title + Level */}
                <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-lg text-slate-800 leading-snug line-clamp-2">
                    {courseItem?.courseName}
                </h2>

                <span className="shrink-0 text-xs font-medium px-3 py-1 rounded-full
                                bg-primary/10 text-primary border border-primary/20">
                    {courseItem?.courseLayout?.level || 'Beginner'}
                </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                bg-slate-100 border border-slate-200">
                    <Layers className="h-3.5 w-3.5" />
                    {courseItem?.courseLayout?.totalChapters || 0} Chapters
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                bg-slate-100 border border-slate-200">
                    <Calendar className="h-3.5 w-3.5" />
                    {moment(courseItem?.createdAt).format("MMM DD, YYYY")}
                </span>
                </div>
            </CardHeader>

            <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Continue where you left off
                </p>

                <Link href={`/course/${courseItem?.courseId}`}>
                    <Button
                    size="sm"
                    className="gap-2 rounded-full px-4"
                    >
                    <Play className="h-4 w-4" />
                    Watch
                    </Button>
                </Link>
                </div>
            </CardContent>
        </Card>
  )
}

export default CourseListCard