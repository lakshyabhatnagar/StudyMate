import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: February 2026</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and course content you create.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide and improve our services</li>
                <li>Generate AI-powered course content</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p>
                We take reasonable measures to protect your personal information from loss, theft, and unauthorized access. Your data is stored securely using industry-standard encryption and security practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
              <p>
                We use third-party services like AI providers and cloud storage to deliver our services. These providers have their own privacy policies and security measures in place.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You can also request that we stop processing your data or provide you with a copy of your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
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

export default PrivacyPage;