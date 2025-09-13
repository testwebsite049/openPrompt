import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Copy, Eye, Sparkles } from 'lucide-react';

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
      <section className="relative bg-white geometric-pattern min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-black rounded-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
              Discover Amazing
              <br />
              <span className="text-gray-700">AI Image Prompts</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Unlock your creativity with our curated collection of proven AI prompts. 
              Perfect for artists, designers, and creators looking to generate stunning visuals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/explore"
                className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold border-2 border-black hover:bg-black hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl">
                Learn More
              </button>
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

      {/* Preview Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
              Explore Our Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get inspired by these sample prompts and their stunning results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sampleImages.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                style={{
                  aspectRatio: index % 3 === 0 ? '3/4' : index % 3 === 1 ? '4/3' : '1/1'
                }}
              >
                <img
                  src={image.src}
                  alt={`Sample prompt ${image.id}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
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
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              See More Prompts
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;