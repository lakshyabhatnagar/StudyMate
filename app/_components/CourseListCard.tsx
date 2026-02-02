import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Course } from '@/type/CourseType'
import { Calendar, Dot, Layers, Link, Play } from 'lucide-react'
import React from 'react'
import moment from 'moment'


type Props={
    courseItem:Course
}
function CourseListCard({courseItem}:Props) {
  return(
        <Card className='bg-white z-10'>
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <h2 className='font-medium text-md'>{courseItem?.courseName}</h2>
                    <h2 className='text-primary p-1 text-sm bg-primary/10 px-2 border rounded-4xl border-primary'>{courseItem?.courseLayout?.level}</h2>
                </div>
                <div className='flex gap-3 items-center'>
                    <h2 className='flex items-center gap-2 text-slate-600 p-1 text-xs bg-slate-400 px-2 border rounded-4xl border-slate-500'>
                        <Layers className='h-4 w-4'/>
                        {courseItem?.courseLayout?.totalChapters} Chapters
                    </h2>
                    <h2 className='flex items-center gap-2 text-slate-600 p-1 text-xs bg-slate-400 px-2 border rounded-4xl border-slate-500'>
                        <Calendar className='h-4 w-4'/>
                        {moment(courseItem?.createdAt).format('MMM DD, YYYY')}
                        <Dot className='h-4 w-4'/>
                        {moment(courseItem?.createdAt).fromNow()}
                    </h2>
                </div>
            </CardHeader>
            <CardContent>
                <div className='flex justify-between items-center'>
                    <p>Keep Learning...</p>
                    <Link href={'/course'+courseItem?.courseId}>
                        <Button>Watch Now <Play /></Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
  )
}

export default CourseListCard