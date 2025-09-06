import React, { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useContentLanguage, contentLanguageOptions } from '../contexts/LanguageContext';

const ContentLanguageSelector: React.FC = () => {
  const { contentLanguage, setContentLanguage } = useContentLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = contentLanguageOptions.find(lang => lang.code === contentLanguage);

  const handleLanguageChange = (langCode: string) => {
    setContentLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
        title="İçerik Dili"
      >
        <Globe size={16} />
        <span className="text-sm">{currentLanguage?.flag}</span>
        <span className="text-sm font-medium">{currentLanguage?.name}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-400 px-2 py-1 border-b border-gray-700 mb-1">
                İçerik Dili Seçin
              </div>
              {contentLanguageOptions.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    contentLanguage === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {contentLanguage === lang.code && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentLanguageSelector;
