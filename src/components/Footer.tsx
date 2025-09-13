import React from 'react';
import { Lightbulb, Camera, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Lightbulb className="w-8 h-8 text-black" />
                <Camera className="w-4 h-4 text-gray-600 absolute -bottom-1 -right-1" />
              </div>
              <span className="text-xl font-bold text-black tracking-tight">
                Open Prompt
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Discover and copy amazing AI image generation prompts. Our curated collection 
              helps AI artists, designers, and creators unlock their full creative potential.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/explore" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Explore Prompts
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">Connect</h3>
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-all duration-200 group"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-all duration-200 group"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-all duration-200 group"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © 2024 Open Prompt. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors duration-200">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;