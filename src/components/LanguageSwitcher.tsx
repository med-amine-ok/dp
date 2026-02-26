import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  {
    code: 'fr',
    flag: '🇫🇷',
    label: 'Français',
    sublabel: 'French',
  },
  {
    code: 'ar',
    flag: '🇩🇿',
    label: 'العربية',
    sublabel: 'Arabic',
  },
] as const;

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language)!;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code: typeof LANGUAGES[number]['code']) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all duration-200 select-none
          ${open
            ? 'bg-white border-blue-300 shadow-lg shadow-blue-100 dark:bg-zinc-900 dark:border-blue-700 dark:shadow-blue-900/30'
            : 'bg-white/70 border-border/50 hover:bg-white hover:border-border hover:shadow-md dark:bg-zinc-900/70 dark:hover:bg-zinc-900'
          } backdrop-blur-sm`}
      >
        <span className="text-xl leading-none">{current.flag}</span>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[11px] font-bold tracking-wide text-foreground">{current.label}</span>
          <span className="text-[9px] text-muted-foreground/70 mt-0.5 tracking-wider uppercase">{current.sublabel}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-52 rounded-2xl border border-border/40 overflow-hidden z-50
          bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl
          shadow-xl shadow-black/10 dark:shadow-black/40
          transition-all duration-200 origin-top-right
          ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-border/30 bg-muted/30">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Select Language
          </p>
        </div>

        {/* Options */}
        <div className="p-1.5 flex flex-col gap-0.5">
          {LANGUAGES.map(({ code, flag, label, sublabel }) => {
            const isActive = language === code;
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-300/40 dark:border-blue-700/40'
                    : 'hover:bg-muted/60 border border-transparent'
                  }`}
              >
                {/* Flag */}
                <span className={`text-2xl leading-none transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                  {flag}
                </span>

                {/* Text */}
                <div className="flex flex-col flex-1 leading-none gap-0.5">
                  <span className={`text-sm font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 tracking-wide uppercase">
                    {sublabel}
                  </span>
                </div>

                {/* Active check */}
                {isActive && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm shadow-blue-400/40">
                    <Check className="h-3 w-3 text-white stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
      </div>
    </div>
  );
};

export default LanguageSwitcher;

