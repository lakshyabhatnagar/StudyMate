import React from 'react';

const CookiesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="space-y-6 text-gray-600">
            <p className="text-sm text-gray-500">Last updated: February 2026</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What Are Cookies</h2>
              <p>
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Cookies</h2>
              <p>We use cookies to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze how our website is used to improve performance</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Types of Cookies We Use</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                  <p className="text-sm">Required for the website to function properly, including authentication and security features.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  <p className="text-sm">Help us understand how visitors interact with our website to improve user experience.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                  <p className="text-sm">Remember your preferences and provide enhanced features.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Most browsers allow you to view, delete, and block cookies. However, disabling cookies may affect the functionality of our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Cookies</h2>
              <p>
                We may use third-party services that set their own cookies. These services have their own cookie policies and we recommend reviewing them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p>
                If you have questions about our use of cookies, please contact us at{' '}
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

export default CookiesPage;