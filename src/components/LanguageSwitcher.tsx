import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left?: number; right?: number }>({
    top: 0,
    right: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language)!;
  const isRTL = language === 'ar';

  // Compute position whenever opening
  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (isRTL) {
        // Arabic: button is on the left → anchor dropdown from left
        setDropdownPos({ top: rect.bottom + 8, left: rect.left });
      } else {
        // French: button is on the right → anchor dropdown from right
        setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      }
    }
    setOpen(prev => !prev);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on scroll/resize
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, []);

  const handleSelect = (code: typeof LANGUAGES[number]['code']) => {
    setLanguage(code);
    setOpen(false);
  };

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        ...(isRTL ? { left: dropdownPos.left } : { right: dropdownPos.right }),
        zIndex: 99999,
      }}
      className={`w-56 rounded-2xl border border-border/70 overflow-hidden
        bg-card/95 backdrop-blur-xl card-shadow
        transition-all duration-200 origin-top-left
        ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
    >
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
                  ? 'bg-accent/65 border border-border/70'
                  : 'hover:bg-muted/65 border border-transparent'
                }`}
            >
              <span className={`text-2xl leading-none transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}>
                {flag}
              </span>
              <div className="flex flex-col flex-1 leading-none gap-0.5">
                <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground/60 tracking-wide uppercase">
                  {sublabel}
                </span>
              </div>
              {isActive && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/95 shadow-[0_8px_14px_-10px_hsl(var(--primary)/0.9)]">
                  <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 select-none
          ${open
            ? 'bg-card border-border card-shadow'
            : 'bg-card/70 border-border/60 hover:bg-card hover:border-border/90 hover:card-shadow'
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

      {/* Dropdown rendered into document.body to escape all stacking contexts */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </>
  );
};

export default LanguageSwitcher;

