'use client'
import React from 'react'
import { PricingTable } from '@clerk/nextjs'

// Separate component for the CTA button
function ScrollToPricingButton() {
  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-table');
    if (pricingSection) {
      pricingSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <button 
      onClick={scrollToPricing}
      className="bg-white text-[#3EACA3] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      Start Creating Now
    </button>
  );
}

function Pricing() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#3EACA3]/10 text-[#3EACA3] px-4 py-2 rounded-full text-sm font-medium mb-6">
            ✨ Simple, transparent pricing
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your 
            <span className="text-[#3EACA3]"> Learning</span> Plan
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform any topic into engaging AI-powered video courses. 
            Start free, upgrade when you're ready to create unlimited content.
          </p>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Clerk Pricing Table Container */}
          <div id="pricing-table" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 scroll-mt-8 transition-all duration-500 hover:shadow-2xl">
            <PricingTable />
          </div>
          
          {/* Features Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-[#3EACA3]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#3EACA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">AI-Powered Generation</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI creates structured courses with engaging content automatically
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-[#3EACA3]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#3EACA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Video Course Creation</h3>
              <p className="text-gray-600 text-sm">
                Transform text content into professional video courses with animations
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-[#3EACA3]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#3EACA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-sm">
                Simple interface - just describe your topic and let AI do the work
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  How does the AI course generation work?
                </h3>
                <p className="text-gray-600">
                  Simply describe your topic, and our AI will create a structured course outline with chapters, 
                  content, and generate professional video presentations automatically.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Can I customize the generated courses?
                </h3>
                <p className="text-gray-600">
                  Yes! You can edit the course content, modify chapters, and adjust the presentation 
                  style to match your teaching preferences.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  What file formats are supported for export?
                </h3>
                <p className="text-gray-600">
                  Generated courses can be exported as video files (MP4), presentation slides (PDF), 
                  or shared directly through our platform.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-linear-to-r from-[#3EACA3] to-[#369a92] rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Create Amazing Courses?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of educators and content creators who are already using StudyMate 
                to transform their ideas into engaging video courses.
              </p>
              <ScrollToPricingButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing