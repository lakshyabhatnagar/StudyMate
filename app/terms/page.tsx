import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: February 2026</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
              <p>
                By accessing and using StudyMate, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Use of Service</h2>
              <p>
                StudyMate provides AI-powered course creation tools. You may use our service to create educational content for personal or commercial purposes, subject to these terms.
              </p>
              <p className="mt-2">You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the service for illegal or unauthorized purposes</li>
                <li>Create content that violates copyright or other intellectual property rights</li>
                <li>Attempt to reverse engineer or compromise our systems</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Content Ownership</h2>
              <p>
                You retain ownership of the content you create using StudyMate. However, you grant us a license to process and store your content to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Service Availability</h2>
              <p>
                We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to modify or discontinue the service with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
              <p>
                StudyMate is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Information</h2>
              <p>
                Questions about these Terms? Contact us at{' '}
                <a href="mailto:lakshyabhatnagar1@gmail.com" className="text-teal-600 hover:underline">
                  lakshyabhatnagar1@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;