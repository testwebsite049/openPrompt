import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

interface ViewCountDebugProps {
  promptId: string;
  currentViews: number;
}

const ViewCountDebug: React.FC<ViewCountDebugProps> = ({ promptId, currentViews }) => {
  const [previousViews, setPreviousViews] = useState(currentViews);
  const [showIncrement, setShowIncrement] = useState(false);

  useEffect(() => {
    if (currentViews > previousViews) {
      setShowIncrement(true);
      setTimeout(() => setShowIncrement(false), 2000);
    }
    setPreviousViews(currentViews);
  }, [currentViews, previousViews]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm z-50">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>Views: {currentViews}</span>
        {showIncrement && (
          <span className="bg-green-500 px-2 py-1 rounded text-xs animate-pulse">
            +1 📈
          </span>
        )}
      </div>
      <div className="text-xs text-gray-300 mt-1">
        ID: {promptId.slice(-6)}
      </div>
    </div>
  );
};

export default ViewCountDebug;