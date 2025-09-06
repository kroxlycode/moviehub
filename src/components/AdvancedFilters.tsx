import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { tmdbApi } from '../services/tmdbApi';

interface Genre {
  id: number;
  name: string;
}

interface FilterState {
  genres: number[];
  year: string;
  rating: number;
  runtime: [number, number];
  sortBy: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  mediaType: 'movie' | 'tv';
  isOpen: boolean;
  onToggle: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  mediaType,
  isOpen,
  onToggle
}) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    year: '',
    rating: 0,
    runtime: [0, 300],
    sortBy: 'popularity.desc'
  });

  const sortOptions = [
    { value: 'popularity.desc', label: 'Popülerlik (Yüksek → Düşük)' },
    { value: 'popularity.asc', label: 'Popülerlik (Düşük → Yüksek)' },
    { value: 'vote_average.desc', label: 'Puan (Yüksek → Düşük)' },
    { value: 'vote_average.asc', label: 'Puan (Düşük → Yüksek)' },
    { value: 'release_date.desc', label: 'Tarih (Yeni → Eski)' },
    { value: 'release_date.asc', label: 'Tarih (Eski → Yeni)' },
    { value: 'title.asc', label: 'Alfabetik (A → Z)' },
    { value: 'title.desc', label: 'Alfabetik (Z → A)' }
  ];

  // Türleri yükle
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = mediaType === 'movie' 
          ? await tmdbApi.getMovieGenres()
          : await tmdbApi.getTVGenres();
        setGenres(response.genres);
      } catch (error) {
        console.error('Türler yüklenirken hata:', error);
      }
    };

    fetchGenres();
  }, [mediaType]);

  // Filtre değişikliklerini parent'a bildir
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleGenreToggle = (genreId: number) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId]
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFilters(prev => ({ ...prev, rating }));
  };

  const handleRuntimeChange = (index: number, value: number) => {
    setFilters(prev => ({
      ...prev,
      runtime: prev.runtime.map((val, i) => i === index ? value : val) as [number, number]
    }));
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      year: '',
      rating: 0,
      runtime: [0, 300],
      sortBy: 'popularity.desc'
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
      >
        <Filter size={16} />
        <span>Filtreler</span>
      </button>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} />
          Gelişmiş Filtreler
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Temizle
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Türler
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {genres.map(genre => (
              <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Yıl
          </label>
          <select
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Yıllar</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Minimum Puan: {filters.rating}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={filters.rating}
            onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {mediaType === 'movie' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Süre: {filters.runtime[0]} - {filters.runtime[1]} dk
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={filters.runtime[0]}
                onChange={(e) => handleRuntimeChange(0, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={filters.runtime[1]}
                onChange={(e) => handleRuntimeChange(1, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        )}

        <div className={mediaType === 'tv' ? 'md:col-span-2 lg:col-span-1' : ''}>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sıralama
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(filters.genres.length > 0 || filters.year || filters.rating > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.genres.map(genreId => {
              const genre = genres.find(g => g.id === genreId);
              return genre ? (
                <span
                  key={genreId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                >
                  {genre.name}
                  <button
                    onClick={() => handleGenreToggle(genreId)}
                    className="hover:bg-blue-700 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
            
            {filters.year && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                {filters.year}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, year: '' }))}
                  className="hover:bg-green-700 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            
            {filters.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                {filters.rating}+ puan
                <button
                  onClick={() => handleRatingChange(0)}
                  className="hover:bg-yellow-700 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
