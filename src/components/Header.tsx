import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lightbulb, Camera } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Lightbulb className="w-8 h-8 text-black group-hover:scale-110 transition-transform duration-200" />
              <Camera className="w-4 h-4 text-gray-600 absolute -bottom-1 -right-1 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className="text-xl font-bold text-black tracking-tight">
              Open Prompt
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/'
                  ? 'text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/explore'
                  ? 'text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Explore
            </Link>
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <Link
            to="/explore"
            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Explore Prompts
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;