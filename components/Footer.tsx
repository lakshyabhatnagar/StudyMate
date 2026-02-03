import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto p-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900"><span className='text-[#3EACA3]'>Study</span>Mate</h3>
              <p className="text-sm text-gray-600 mt-2">
                AI-powered course creation platform for modern learning
              </p>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  About Me
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:lakshyabhatnagar1@gmail.com" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © 2026 StudyMate. All rights reserved.
            </div>
            <div className="text-sm text-gray-500">
              Created by Lakshya Bhatnagar
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;