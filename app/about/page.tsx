import React from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-32 h-32 bg-teal-600 rounded-full mx-auto flex items-center justify-center text-white text-4xl font-bold">
              LB
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hi, I'm <span className="text-teal-600">Lakshya Bhatnagar</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creator of StudyMate - passionate about building AI-powered solutions that make education more accessible and engaging.
          </p>
        </div>

        {/* About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Welcome to StudyMate! I'm a passionate developer and educator who believes in the power of technology to transform learning experiences.
              </p>
              <p>
                With a background in software development and a love for education, I created StudyMate to bridge the gap between traditional learning methods and modern AI technology.
              </p>
              <p>
                My goal is to empower educators and learners worldwide with tools that make creating and consuming educational content more efficient, engaging, and accessible.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What I Do</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">AI Development</h3>
                <p className="text-gray-600 text-sm">Building intelligent systems that understand and generate educational content.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">EdTech Innovation</h3>
                <p className="text-gray-600 text-sm">Creating tools that revolutionize how we approach modern education.</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">User Experience</h3>
                <p className="text-gray-600 text-sm">Designing intuitive interfaces that make complex technology accessible to everyone.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions about StudyMate or want to collaborate? I'd love to hear from you!
          </p>
          
          <div className="flex justify-center space-x-6">
            <a
              href="mailto:lakshyabhatnagar1@gmail.com"
              className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>Email Me</span>
            </a>
            {/* Add your social links here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;