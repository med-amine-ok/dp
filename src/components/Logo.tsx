import React from 'react';

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
            <div className={`relative flex items-center justify-center text-white bg-primary rounded-full font-bold ${iconClasses[size]}`}>
                <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-base'}>DP</span>
            </div>
            <span className={textClasses[size]}>DP Kid</span>
        </div>
    );
};

export default Logo;
