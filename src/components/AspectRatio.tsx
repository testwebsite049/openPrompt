import React from 'react';
import { cn } from '../utils/cn';

interface AspectRatioProps {
  ratio: number;
  children: React.ReactNode;
  className?: string;
}

const AspectRatio: React.FC<AspectRatioProps> = ({ ratio, children, className }) => {
  return (
    <div className={cn("relative w-full", className)}>
      <div 
        className="w-full"
        style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
      />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

export default AspectRatio;