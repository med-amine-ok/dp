import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-full hover:bg-secondary transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === 'fr' ? 'العربية' : 'Français'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
