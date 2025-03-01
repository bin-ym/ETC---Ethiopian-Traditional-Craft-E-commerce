// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 mt-auto bg-gray-100 border-t border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="mb-4 text-sm text-gray-600 md:mb-0">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="/about" className="text-sm text-gray-600 hover:text-blue-600">
              About Us
            </a>
            <a href="/contact" className="text-sm text-gray-600 hover:text-blue-600">
              Contact
            </a>
            <a href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;