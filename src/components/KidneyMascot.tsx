import React from 'react';
import { cn } from '@/lib/utils';

interface KidneyMascotProps {
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'thinking' | 'waving';
  className?: string;
  animate?: boolean;
}

const KidneyMascot: React.FC<KidneyMascotProps> = ({
  size = 'md',
  mood = 'happy',
  className,
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const getEmoji = () => {
    switch (mood) {
      case 'thinking':
        return '🤔';
      case 'waving':
        return '👋';
      default:
        return '😊';
    }
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        animate && 'animate-float',
        className
      )}
    >
      {/* Kidney Shape */}
      <div className="relative">
        <svg
          viewBox="0 0 100 120"
          className={cn('drop-shadow-lg', sizeClasses[size])}
        >
          {/* Main kidney body */}
          <path
            d="M50 10 C20 10, 10 40, 15 60 C20 80, 30 100, 50 110 C70 100, 80 80, 85 60 C90 40, 80 10, 50 10 Z"
            fill="hsl(330 70% 75%)"
            stroke="hsl(330 70% 65%)"
            strokeWidth="2"
          />
          {/* Inner curve */}
          <path
            d="M50 25 C35 25, 25 45, 30 65 C35 80, 45 95, 50 100"
            fill="none"
            stroke="hsl(330 70% 70%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Blush */}
          <ellipse cx="35" cy="55" rx="8" ry="5" fill="hsl(0 70% 80%)" opacity="0.5" />
          <ellipse cx="65" cy="55" rx="8" ry="5" fill="hsl(0 70% 80%)" opacity="0.5" />
        </svg>
        
        {/* Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex gap-3 mb-1">
            {/* Eyes */}
            <div className="w-2 h-3 bg-foreground rounded-full" />
            <div className="w-2 h-3 bg-foreground rounded-full" />
          </div>
          {/* Mouth */}
          <div className="text-xl">{getEmoji()}</div>
        </div>

        {/* Waving hand for waving mood */}
        {mood === 'waving' && (
          <div className="absolute -right-2 top-1/4 text-2xl animate-wiggle">
            👋
          </div>
        )}
      </div>
    </div>
  );
};

export default KidneyMascot;
