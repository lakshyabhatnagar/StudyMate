"use client"
import React, { useState } from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Loader2, Send } from 'lucide-react'
import dynamic from "next/dynamic";
import { QUICK_VIDEO_SUGGESTIONS } from '@/data/constant'
import axios from 'axios'
import { toast } from 'sonner'
import { SignInButton, useUser } from '@clerk/nextjs'

const HeroSelect = dynamic(() => import("./HeroSelect"), {
  ssr: false,
});


function Hero() {
    const [userInput, setUserInput]=useState("");
    const [type, setType]=useState("full-course");
    const [loading,setLoading]=useState(false);
    const {user}=useUser();

    const GenerateCourseLayout = async () => {
    let toastId;
    try {
        setLoading(true);
        toastId = toast.loading("Generating course layout...");
        const courseID=await crypto.randomUUID();

        const result = await axios.post('/api/generate-course-layout', {
        userInput,
        type,
        courseId: courseID,
        });

        console.log("Course Layout Generated:", result.data);
    } catch (err) {
        console.error(err);
        toast.error("Failed to generate course");
        toast.dismiss(toastId);
    } finally {
        setLoading(false);
    }
    toast.success("Course layout generated successfully!", {id:toastId}); 
};

    return (
    <div className='flex items-center flex-col mt-20'>
        <div>
            <h2 className='text-4xl font-bold'>Learn Smarter with <span style={{color: '#3EACA3'}}>AI Video Courses</span></h2>
            <p className='text-center text-gray-500 mt-3 text-xl font-bold'>Turn Any Topic Into a Complete Course</p>
        </div>
        <div className="grid w-full max-w-xl mt-5 gap-6 bg-white z-10">
            <InputGroup>
                <InputGroupTextarea
                data-slot="input-group-control"
                className="flex field-sizing-content min-h-24 w-full resize-none rounded-xl bg-white px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                placeholder="Generate a course..."
                value={userInput}
                onChange={(e)=>setUserInput(e.target.value)}
                />
                <InputGroupAddon align="block-end">
                <HeroSelect value={type} onChange={setType} />
                {user?
                <InputGroupButton className="ml-auto" size="icon-sm" variant="default"
                    onClick={GenerateCourseLayout}
                    disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" />:<Send />}
                </InputGroupButton>
                :<SignInButton mode='modal'>
                    <InputGroupButton className="ml-auto" size="icon-sm" variant="default">
                        <Send />
                    </InputGroupButton>
                </SignInButton>
                }   
                </InputGroupAddon>
            </InputGroup>
        </div>
        <div className='flex gap-5 mt-5 max-w-3xl flex-wrap justify-center z-10'>
            {QUICK_VIDEO_SUGGESTIONS.map((suggestion, index) => (
                <h2
                    key={index}
                    onClick={() => setUserInput(suggestion?.prompt)}
                    className='border rounded-2xl px-2 cursor-pointer p-1 text-sm bg-white'
                >
                    {suggestion.title}
                </h2>
            ))}
        </div>
    </div>
  )
}

export default Hero