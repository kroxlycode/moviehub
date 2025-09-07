import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Tv, User } from 'lucide-react';
import { Movie, TVShow, Person, tmdbApi, getImageUrl } from '../services/tmdbApi';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string;
  profile_path?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  known_for_department?: string;
}

interface SearchDropdownProps {
  onItemClick: (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => void;
  onSearchPageClick: (query: string) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ onItemClick, onSearchPageClick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        searchContent(query.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchContent = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await tmdbApi.searchMulti(searchQuery, 1);
      const filteredResults = response.results
        .filter(item => (item as any).media_type !== 'person' || (item as any).profile_path)
        .slice(0, 8)
        .map(item => ({
          ...item,
          media_type: (item as any).media_type || 'movie'
        }));
      
      setResults(filteredResults as SearchResult[]);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearchAll();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const item = result as any;
    onItemClick(item, result.media_type);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearchAll = () => {
    onSearchPageClick(query);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getResultImage = (result: SearchResult) => {
    if (result.media_type === 'person') {
      return getImageUrl(result.profile_path || null, 'profile', 'small');
    }
    return getImageUrl(result.poster_path || null, 'poster', 'small');
  };

  const getResultTitle = (result: SearchResult) => {
    return result.title || result.name || '';
  };

  const getResultSubtitle = (result: SearchResult) => {
    if (result.media_type === 'person') {
      return result.known_for_department || 'Kişi';
    }
    const date = result.release_date || result.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  };

  const getResultIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'movie':
        return <Film className="w-4 h-4" />;
      case 'tv':
        return <Tv className="w-4 h-4" />;
      case 'person':
        return <User className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Film, dizi veya kişi ara..."
          className="w-full px-4 py-2 pl-12 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
        />
        
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-lighter/95 backdrop-blur-md border border-gray-custom/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary mx-auto"></div>
              <p className="text-gray-400 text-sm mt-2">Aranıyor...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={`${result.media_type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`flex items-center p-3 hover:bg-white/10 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="w-12 h-16 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                      <img
                        src={getResultImage(result)}
                        alt={getResultTitle(result)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="text-secondary">
                          {getResultIcon(result.media_type)}
                        </div>
                        <h4 className="text-white font-medium text-sm truncate">
                          {getResultTitle(result)}
                        </h4>
                      </div>
                      
                      <p className="text-gray-400 text-xs truncate">
                        {getResultSubtitle(result)}
                      </p>
                      
                      {result.overview && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                          {result.overview}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-custom/20 p-3">
                <button
                  onClick={handleSearchAll}
                  className="w-full text-left text-secondary hover:text-secondary/80 text-sm font-medium transition-colors"
                >
                  "{query}" için tüm sonuçları gör →
                </button>
              </div>
            </>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">Sonuç bulunamadı</p>
              <button
                onClick={handleSearchAll}
                className="text-secondary hover:text-secondary/80 text-sm mt-2 transition-colors"
              >
                Detaylı arama yap →
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
