import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Film, Tv, User } from 'lucide-react';
import { Movie, TVShow, Person, tmdbApi, getImageUrl } from '../services/tmdbApi';
import { useLanguage } from '../contexts/LanguageContext';
import GridLayout from '../components/GridLayout';
import Pagination from '../components/Pagination';

interface SearchResultsPageProps {
  query: string;
  onBack: () => void;
  onItemClick: (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => void;
  onPlayTrailer: (item: Movie | TVShow) => void;
}

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
  vote_average?: number;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ 
  query, 
  onBack, 
  onItemClick, 
  onPlayTrailer 
}) => {
  const { t } = useLanguage();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'movie' | 'tv' | 'person'>('all');

  useEffect(() => {
    if (query) {
      searchContent(query, currentPage);
    }
  }, [query, currentPage, activeTab]);

  const searchContent = async (searchQuery: string, page: number) => {
    try {
      setLoading(true);
      const response = await tmdbApi.searchMulti(searchQuery, page);
      
      let filteredResults = response.results.map(item => ({
        ...item,
        media_type: (item as any).media_type || 'movie'
      })) as SearchResult[];

      // Filter by active tab
      if (activeTab !== 'all') {
        filteredResults = filteredResults.filter(item => item.media_type === activeTab);
      }

      setResults(filteredResults);
      setTotalPages(response.total_pages);
      setTotalResults(response.total_results);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'all' | 'movie' | 'tv' | 'person') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getResultImage = (result: SearchResult) => {
    if (result.media_type === 'person') {
      return getImageUrl(result.profile_path || null, 'profile', 'medium');
    }
    return getImageUrl(result.poster_path || null, 'poster', 'medium');
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

  const getTabIcon = (type: string) => {
    switch (type) {
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

  const tabs = [
    { id: 'all', label: 'Tümü', count: totalResults },
    { id: 'movie', label: 'Filmler', count: 0 },
    { id: 'tv', label: 'Diziler', count: 0 },
    { id: 'person', label: 'Kişiler', count: 0 }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-gray-custom/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Arama Sonuçları</h1>
              <p className="text-gray-300">
                "<span className="text-secondary">{query}</span>" için {totalResults} sonuç bulundu
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-dark/50 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-secondary text-dark font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {getTabIcon(tab.id)}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Aranıyor...</p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <>
            <GridLayout
              items={results.map(result => ({
                id: result.id,
                title: getResultTitle(result),
                name: getResultTitle(result),
                poster_path: result.poster_path || null,
                profile_path: result.profile_path || null,
                release_date: result.release_date || '',
                first_air_date: result.first_air_date || '',
                vote_average: result.vote_average || 0,
                overview: result.overview || '',
                known_for_department: result.known_for_department || '',
                // Required fields for type compatibility
                backdrop_path: null,
                vote_count: 0,
                genre_ids: [],
                original_language: 'en',
                original_title: getResultTitle(result),
                popularity: 0,
                adult: false,
                video: false
              } as Movie))}
              onItemClick={(item) => {
                const result = results.find(r => r.id === item.id);
                if (result) {
                  onItemClick(item as any, result.media_type);
                }
              }}
              onPlayTrailer={onPlayTrailer}
              loading={false}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sonuç Bulunamadı</h3>
            <p className="text-gray-400 mb-6">
              "<span className="text-secondary">{query}</span>" için herhangi bir sonuç bulunamadı.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-dark font-semibold rounded-lg transition-colors"
            >
              Geri Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
