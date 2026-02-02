"use client";
import React from 'react'
import Image from 'next/image'
import { SignInButton, useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import  Link from 'next/link';

function Header() {
    const {user}=useUser();
  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b bg-transparent">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="logo" width={48} height={48} />
        <h2 className="text-2xl font-bold">
          <span className="text-[#3EACA3]">Study</span>Mate
        </h2>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="flex items-center gap-8">
          <li>
            <Link
              href="/"
              className="text-lg font-medium hover:text-[#3EACA3] transition-colors"
            >
              Home
            </Link>
          </li>

          <li>
            <Link
              href="/pricing"
              className="text-lg font-medium hover:text-[#3EACA3] transition-colors"
            >
              Pricing
            </Link>
          </li>
        </ul>
      </nav>

      {/* Auth */}
      {user ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <Button className="bg-[#3EACA3] text-white hover:bg-[#369a92]">
            Get Started
          </Button>
        </SignInButton>
      )}
    </header>
  )
}

export default Header