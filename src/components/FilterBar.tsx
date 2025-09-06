import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar, Star, Clock } from 'lucide-react';
import { Genre, tmdbApi } from '../services/tmdbApi';

interface FilterOptions {
  genre?: number;
  year?: number;
  sortBy?: string;
  voteAverageGte?: number;
  voteAverageLte?: number;
  withRuntimeGte?: number;
  withRuntimeLte?: number;
}

interface FilterBarProps {
  type: 'movie' | 'tv';
  onFilterChange: (filters: FilterOptions) => void;
  loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ type, onFilterChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({});

  useEffect(() => {
    loadGenres();
  }, [type]);

  const loadGenres = async () => {
    try {
      const response = type === 'movie' 
        ? await tmdbApi.getMovieGenres()
        : await tmdbApi.getTVGenres();
      setGenres(response.genres);
    } catch (error) {
      console.error('Error loading genres:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof FilterOptions] !== undefined
  );

  const sortOptions = [
    { value: 'popularity.desc', label: 'Popülerlik (Azalan)' },
    { value: 'popularity.asc', label: 'Popülerlik (Artan)' },
    { value: 'vote_average.desc', label: 'Rating (Azalan)' },
    { value: 'vote_average.asc', label: 'Rating (Artan)' },
    { value: 'release_date.desc', label: type === 'movie' ? 'Çıkış Tarihi (Yeni)' : 'Yayın Tarihi (Yeni)' },
    { value: 'release_date.asc', label: type === 'movie' ? 'Çıkış Tarihi (Eski)' : 'Yayın Tarihi (Eski)' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="bg-dark-lighter/80 backdrop-blur-sm border border-gray-custom/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-white hover:text-secondary transition-colors"
          disabled={loading}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtreler</span>
          {hasActiveFilters && (
            <span className="bg-secondary text-dark text-xs px-2 py-1 rounded-full font-semibold">
              {Object.keys(filters).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tür
            </label>
            <select
              value={filters.genre || ''}
              onChange={(e) => handleFilterChange('genre', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="">Tüm Türler</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Yıl
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="">Tüm Yıllar</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sıralama
            </label>
            <select
              value={filters.sortBy || 'popularity.desc'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Min. Rating
            </label>
            <select
              value={filters.voteAverageGte || ''}
              onChange={(e) => handleFilterChange('voteAverageGte', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="">Tüm Ratingler</option>
              <option value="7">7.0+</option>
              <option value="8">8.0+</option>
              <option value="9">9.0+</option>
            </select>
          </div>

          {/* Runtime Filter (Movies only) */}
          {type === 'movie' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Süre (dakika)
              </label>
              <div className="flex space-x-2">
                <select
                  value={filters.withRuntimeGte || ''}
                  onChange={(e) => handleFilterChange('withRuntimeGte', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Min</option>
                  <option value="60">60 dk</option>
                  <option value="90">90 dk</option>
                  <option value="120">120 dk</option>
                  <option value="150">150 dk</option>
                </select>
                <select
                  value={filters.withRuntimeLte || ''}
                  onChange={(e) => handleFilterChange('withRuntimeLte', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="">Max</option>
                  <option value="90">90 dk</option>
                  <option value="120">120 dk</option>
                  <option value="150">150 dk</option>
                  <option value="180">180 dk</option>
                  <option value="240">240 dk</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
