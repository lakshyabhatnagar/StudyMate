import React from 'react';
import { Brain, Zap, Video, MessageSquare, Sparkles, Clock } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-teal-600" />,
      title: "AI-Powered Course Generation",
      description: "Create comprehensive courses instantly using advanced AI technology that understands your topic and generates structured, engaging content."
    },
    {
      icon: <Video className="w-8 h-8 text-teal-600" />,
      title: "Automatic Video Creation",
      description: "Transform your course content into professional videos with AI-generated narration, slides, and visual presentations."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-teal-600" />,
      title: "High-Quality Text-to-Speech",
      description: "Convert your course content into natural-sounding audio using ElevenLabs' premium voice synthesis technology."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-teal-600" />,
      title: "Interactive Content",
      description: "Engage learners with interactive elements, animations, and reveal effects that enhance the learning experience."
    },
    {
      icon: <Clock className="w-8 h-8 text-teal-600" />,
      title: "Lightning Fast",
      description: "Generate complete courses in minutes, not hours. Our optimized pipeline ensures quick turnaround times."
    },
    {
      icon: <Zap className="w-8 h-8 text-teal-600" />,
      title: "Smart Course Structure",
      description: "AI automatically organizes your content into logical chapters and sections for optimal learning flow."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for <span className="text-teal-600">Modern Learning</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            StudyMate combines cutting-edge AI technology with intuitive design to revolutionize how you create and consume educational content.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of educators who are already using StudyMate to create amazing courses.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;