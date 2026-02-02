"use client"
import React from 'react'
import Image from 'next/image'
import { SignInButton, useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

function Header() {
    const {user}=useUser();
  return (
    <div className='flex items-center justify-between p-4'>
        <div className='flex items-center gap-2 p-4'>
            <Image src={'/logo.png'} alt="logo" width={75} height={75} />
            <h2 className='text-xl font-bold'><span style={{color: '#3EACA3'}}>Study</span>Mate</h2>
        </div>
        <ul className='flex gap-8 items-center'>
        <Link href={'/'}><li className="text-lg font-medium cursor-pointer hover:text-[#3EACA3]">Home</li></Link>
        <Link href={'/pricing'}><li className="text-lg font-medium cursor-pointer hover:text-[#3EACA3]">Pricing</li></Link>
        </ul>

        {user?
        <UserButton/>:
        <SignInButton mode='modal'> 
            <Button className='bg-[#3EACA3] text-white'>Get Started</Button>
        </SignInButton>
        }
    </div>
  )
}

export default Header