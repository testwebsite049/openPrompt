import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Copy, Eye, Sparkles, Star, Zap, Heart } from 'lucide-react';

const LandingPage: React.FC = () => {
  const sampleImages = [
    {
      id: 1,
      src: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      prompt: 'Portrait of a mystical woman with flowing hair, ethereal lighting...',
      category: 'Portrait'
    },
    {
      id: 2,
      src: 'https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      prompt: 'Futuristic cyberpunk city at night, neon lights, rain-soaked streets...',
      category: 'Landscape'
    },
    {
      id: 3,
      src: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      prompt: 'Abstract geometric patterns, minimalist design, clean composition...',
      category: 'Abstract'
    },
    {
      id: 4,
      src: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop',
      prompt: 'Majestic lion in golden hour lighting, wildlife photography style...',
      category: 'Animals'
    },
    {
      id: 5,
      src: 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      prompt: 'Modern architectural marvel, glass and steel, urban environment...',
      category: 'Architecture'
    },
    {
      id: 6,
      src: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      prompt: 'Vintage retro aesthetic, warm tones, nostalgic atmosphere...',
      category: 'Vintage'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            {/* Icon with enhanced styling */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="p-6 bg-gradient-to-br from-black to-gray-800 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce"></div>
              </div>
            </div>
            
            {/* Enhanced Typography */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-800 to-gray-600 mb-8 tracking-tight leading-tight">
              Discover Amazing
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Image Prompts
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Unlock your creativity with our curated collection of proven AI prompts. 
              Perfect for artists, designers, and creators looking to generate stunning visuals.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                to="/explore"
                className="group bg-gradient-to-r from-black to-gray-800 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-gray-800 hover:to-black hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center gap-3 relative overflow-hidden"
              >
                <span className="relative z-10">Start Exploring</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <button className="group bg-white text-black px-10 py-5 rounded-2xl text-xl font-semibold border-2 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3">
                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                Learn More
              </button>
            </div>
            
            {/* Stats or Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">1000+</div>
                <div className="text-gray-600">Curated Prompts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">50+</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Why Choose Open Prompt?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create amazing AI-generated images
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Curated Collection</h3>
              <p className="text-gray-600 leading-relaxed">
                Hand-picked, high-quality prompts tested and proven to generate stunning results. 
                No more trial and error – just reliable, beautiful outputs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Copy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Easy Copy</h3>
              <p className="text-gray-600 leading-relaxed">
                One-click copying functionality makes it effortless to use any prompt. 
                Simply hover, click copy, and paste into your favorite AI tool.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:scale-105">
              <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-black mb-4">Visual Preview</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly what each prompt can create before using it. 
                Visual examples help you choose the perfect prompt for your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Our Collection - New Design */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Featured Collection
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6">
              Explore Our
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Collection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of the most effective AI prompts, 
              organized by category and ready to unleash your creativity.
            </p>
          </div>

          {/* Featured Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Category 1 - Portrait */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Portrait</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stunning character portraits, professional headshots, and artistic human representations.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">250+ prompts</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Category 2 - Landscape */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Landscape</h3>
                <p className="text-gray-600 leading-relaxed">
                  Breathtaking natural scenes, urban environments, and atmospheric landscapes.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">180+ prompts</span>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>

            {/* Category 3 - Abstract */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Abstract</h3>
                <p className="text-gray-600 leading-relaxed">
                  Creative abstract art, geometric patterns, and experimental visual concepts.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">120+ prompts</span>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Sample Images Showcase */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Prompts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleImages.slice(0, 6).map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.src}
                      alt={`Sample prompt ${image.id}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30 mb-3">
                        {image.category}
                      </span>
                      <p className="text-white text-sm font-mono leading-relaxed line-clamp-3">
                        "{image.prompt}"
                      </p>
                    </div>
                  </div>
                  
                  {/* Copy Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors duration-200">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to Create Amazing Images?
                </h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators who are already using our prompts to generate stunning visuals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/explore"
                    className="group bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
                  >
                    Explore All Prompts
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <button className="group bg-transparent text-white px-8 py-4 rounded-xl text-lg font-semibold border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-200 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    Learn How
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;