import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import deTranslations from '../locales/de.json';

type Locale = 'en' | 'de';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations = {
  en: enTranslations,
  de: deTranslations,
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem('locale');
    return (saved as Locale) || 'de';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};