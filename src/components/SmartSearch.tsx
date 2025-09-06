import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff, X, Camera } from 'lucide-react';
import { tmdbApi, Movie, TVShow, Person } from '../services/tmdbApi';

// Web Speech API type declarations
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface SearchSuggestion {
  id: number;
  title: string;
  type: 'movie' | 'tv' | 'person';
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
}

interface SmartSearchProps {
  onItemClick: (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => void;
  onSearchPageClick: (query: string) => void;
}

const SmartSearch: React.FC<SmartSearchProps> = ({ onItemClick, onSearchPageClick }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<ISpeechRecognition | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Web Speech API setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'tr-TR';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Yazım hatası düzeltme fonksiyonu
  const correctTypos = (text: string): string => {
    const corrections: { [key: string]: string } = {
      // Türkçe yaygın yazım hataları
      'flim': 'film',
      'dzi': 'dizi',
      'aksiyn': 'aksiyon',
      'komdi': 'komedi',
      'dram': 'drama',
      'korku': 'korku',
      'bilim': 'bilim',
      'kurgu': 'kurgu',
      'romantik': 'romantik',
      'macera': 'macera',
      'gerilim': 'gerilim',
      'animasyon': 'animasyon',
      'belgesel': 'belgesel',
      'müzikal': 'müzikal',
      'western': 'western',
      'savaş': 'savaş',
      'tarih': 'tarih',
      'biyografi': 'biyografi',
      'suç': 'suç',
      'gizem': 'gizem',
      'fantastik': 'fantastik',
      'aile': 'aile',
      'çocuk': 'çocuk',
      // İngilizce yaygın yazım hataları
      'moive': 'movie',
      'serie': 'series',
      'actoin': 'action',
      'comdy': 'comedy',
      'horor': 'horror',
      'scifi': 'sci-fi',
      'romace': 'romance',
      'adventur': 'adventure',
      'thriler': 'thriller',
      'animaton': 'animation',
      'documntary': 'documentary',
      'musial': 'musical',
      'biograpy': 'biography',
      'mistery': 'mystery',
      'fantsy': 'fantasy',
      'famly': 'family'
    };

    let correctedText = text.toLowerCase();
    
    // Kelime kelime kontrol et ve düzelt
    Object.entries(corrections).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correct);
    });

    return correctedText;
  };

  // Arama önerileri getir
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Yazım hatası düzeltmesi uygula
      const correctedQuery = correctTypos(searchQuery);
      
      const response = await tmdbApi.searchMulti(correctedQuery, 1);
      const formattedSuggestions: SearchSuggestion[] = response.results
        .slice(0, 8)
        .map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          type: item.media_type,
          poster_path: item.poster_path,
          profile_path: item.profile_path,
          release_date: item.release_date,
          first_air_date: item.first_air_date
        }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Arama önerileri alınırken hata:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query]);

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchPageClick(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const item = suggestion as any;
    onItemClick(item, suggestion.type);
    setQuery('');
    setShowSuggestions(false);
  };

  const startVoiceSearch = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopVoiceSearch = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Görsel arama için placeholder - gerçek implementasyon için
      // Google Vision API veya benzeri bir servis kullanılabilir
      console.log('Görsel arama:', file);
      alert('Görsel arama özelliği yakında eklenecek!');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'movie': return 'Film';
      case 'tv': return 'Dizi';
      case 'person': return 'Kişi';
      default: return '';
    }
  };

  const getYear = (suggestion: SearchSuggestion) => {
    const date = suggestion.release_date || suggestion.first_air_date;
    return date ? new Date(date).getFullYear() : '';
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Film, dizi veya oyuncu ara... (sesli arama için mikrofona tıklayın)"
            className="w-full pl-12 pr-24 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Görsel Arama */}
            <label className="cursor-pointer p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Sesli Arama */}
            {recognition && (
              <button
                type="button"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`p-2 rounded-md transition-colors ${
                  isListening 
                    ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={isListening ? 'Dinlemeyi durdur' : 'Sesli arama'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            {/* Temizle */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700"
                title="Temizle"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Sesli arama göstergesi */}
        {isListening && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Dinleniyor... Konuşmaya başlayın</span>
            </div>
          </div>
        )}
      </form>

      {/* Arama Önerileri */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Aranıyor...
            </div>
          ) : (
            <>
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700 last:border-b-0"
                >
                  <div className="w-12 h-16 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                    {(suggestion.poster_path || suggestion.profile_path) ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${suggestion.poster_path || suggestion.profile_path}`}
                        alt={suggestion.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Search size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white truncate">{suggestion.title}</h4>
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full flex-shrink-0">
                        {getTypeLabel(suggestion.type)}
                      </span>
                    </div>
                    {getYear(suggestion) && (
                      <p className="text-sm text-gray-400">{getYear(suggestion)}</p>
                    )}
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <button
                  onClick={() => handleSubmit(new Event('submit') as any)}
                  className="w-full p-3 text-left text-blue-400 hover:bg-gray-700 transition-colors border-t border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <Search size={16} />
                    <span>"{query}" için tüm sonuçları gör</span>
                  </div>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
