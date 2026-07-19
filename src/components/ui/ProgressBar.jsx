import React from 'react';
import { cn } from './Card';

export function ProgressBar({ progress, className }) {
  return (
    <div className={cn("w-full bg-slate-200 rounded-full h-2.5 overflow-hidden", className)}>
      <div 
        className="bg-municipal-indigo h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
