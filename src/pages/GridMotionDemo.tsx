import React from 'react';
import { GridMotion } from '@/components/ui/grid-motion';
import { PromptGridMotion } from '@/components/ui/prompt-grid-motion';

const GridMotionDemo: React.FC = () => {
  const sampleImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&auto=format',
      prompt: 'Portrait of a mystical woman with flowing hair, ethereal lighting...',
      category: 'Portrait'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
      prompt: 'Futuristic cyberpunk city at night, neon lights, rain-soaked streets...',
      category: 'Landscape'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop&auto=format',
      prompt: 'Abstract geometric patterns, minimalist design, clean composition...',
      category: 'Abstract'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop&auto=format',
      prompt: 'Majestic lion in golden hour lighting, wildlife photography style...',
      category: 'Animals'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format',
      prompt: 'Modern architectural marvel, glass and steel, urban environment...',
      category: 'Architecture'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&auto=format',
      prompt: 'Vintage retro aesthetic, warm tones, nostalgic atmosphere...',
      category: 'Vintage'
    }
  ];

  const demoItems = [
    'Item 1',
    <div key='jsx-item-1' className="text-center">
      <div className="text-2xl mb-2">🎨</div>
      <div className="text-sm">Custom JSX</div>
    </div>,
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop&auto=format',
    'Item 2',
    <div key='jsx-item-2' className="text-center">
      <div className="text-2xl mb-2">✨</div>
      <div className="text-sm">Magic</div>
    </div>,
    'Item 4',
    <div key='jsx-item-3' className="text-center">
      <div className="text-2xl mb-2">🚀</div>
      <div className="text-sm">Innovation</div>
    </div>,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
    'Item 5',
    <div key='jsx-item-4' className="text-center">
      <div className="text-2xl mb-2">🎯</div>
      <div className="text-sm">Precision</div>
    </div>,
    'Item 7',
    <div key='jsx-item-5' className="text-center">
      <div className="text-2xl mb-2">🌟</div>
      <div className="text-sm">Excellence</div>
    </div>,
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop&auto=format',
    'Item 8',
    <div key='jsx-item-6' className="text-center">
      <div className="text-2xl mb-2">💡</div>
      <div className="text-sm">Ideas</div>
    </div>,
    'Item 10',
    <div key='jsx-item-7' className="text-center">
      <div className="text-2xl mb-2">🎪</div>
      <div className="text-sm">Fun</div>
    </div>,
    'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=400&h=300&fit=crop&auto=format',
    'Item 11',
    <div key='jsx-item-8' className="text-center">
      <div className="text-2xl mb-2">🔥</div>
      <div className="text-sm">Hot</div>
    </div>,
    'Item 13',
    <div key='jsx-item-9' className="text-center">
      <div className="text-2xl mb-2">⚡</div>
      <div className="text-sm">Fast</div>
    </div>,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&auto=format',
    'Item 14',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">GridMotion Component Demo</h1>
        
        {/* Default GridMotion */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Default GridMotion</h2>
          <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden">
            <GridMotion />
          </div>
        </section>

        {/* Custom GridMotion with mixed content */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">Custom GridMotion with Mixed Content</h2>
          <div className="h-screen w-full bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl overflow-hidden">
            <GridMotion 
              items={demoItems}
              gradientColor="rgba(147, 51, 234, 0.1)"
              className="relative z-10"
            />
          </div>
        </section>

        {/* PromptGridMotion */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4">PromptGridMotion (Used in Landing Page)</h2>
          <div className="h-screen w-full bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl overflow-hidden">
            <PromptGridMotion 
              items={sampleImages}
              gradientColor="rgba(16, 185, 129, 0.1)"
              className="opacity-80"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default GridMotionDemo;
