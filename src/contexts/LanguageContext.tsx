import React, { createContext, useContext, useState, type ReactNode } from 'react';

type ContentLanguage = 'tr' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko';

interface ContentLanguageContextType {
  contentLanguage: ContentLanguage;
  setContentLanguage: (language: ContentLanguage) => void;
}

const ContentLanguageContext = createContext<ContentLanguageContextType | undefined>(undefined);

export const contentLanguageOptions = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
] as const;

export const getApiLanguageCode = (contentLang: ContentLanguage): string => {
  const mapping: Record<ContentLanguage, string> = {
    'tr': 'tr-TR',
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-PT',
    'ja': 'ja-JP',
    'ko': 'ko-KR'
  };
  return mapping[contentLang];
};

interface ContentLanguageProviderProps {
  children: ReactNode;
}

export const ContentLanguageProvider: React.FC<ContentLanguageProviderProps> = ({ children }) => {
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>('tr');

  return (
    <ContentLanguageContext.Provider value={{ contentLanguage, setContentLanguage }}>
      {children}
    </ContentLanguageContext.Provider>
  );
};

export const useContentLanguage = (): ContentLanguageContextType => {
  const context = useContext(ContentLanguageContext);
  if (context === undefined) {
    throw new Error('useContentLanguage must be used within a ContentLanguageProvider');
  }
  return context;
};

export const useLanguage = useContentLanguage;
export const LanguageProvider = ContentLanguageProvider;
