import { useState, useEffect } from 'react';
import { Button } from '@openbb/ui';
import i18n from '../i18n';

interface Language {
  value: string;
  label: string;
}

const languages: Language[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
];

const LanguageSelector = () => {
  // Load language from localStorage if available, otherwise use i18n's current language
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || i18n.language;
  });

  useEffect(() => {
    // Change language if different from current
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  return (
    <div className="flex gap-2">
      {languages.map((language) => (
        <Button
          key={language.value}
          variant={selectedLanguage === language.value ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange(language.value)}
        >
          {language.label}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSelector;