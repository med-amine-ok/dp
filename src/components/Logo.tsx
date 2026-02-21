import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
    const baseSize = {
        sm: 'w-6 h-6 text-lg',
        md: 'w-8 h-8 text-2xl',
        lg: 'w-12 h-12 text-4xl',
    };

    const iconClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    const textClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-4xl',
    };

    return (
        <div className={`flex items-center gap-2 font-black tracking-tight text-primary ${className}`}>
            <img
                src="/logo1.png"
                alt="DP Kid Logo"
                className={cn(
                    "object-contain",
                    size === 'sm' ? 'h-8' : size === 'lg' ? 'h-18' : 'h-12'
                )}
            />
           
        </div>
    );
};

export default Logo;
