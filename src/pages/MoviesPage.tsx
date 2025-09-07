import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { Movie, tmdbApi } from '../services/tmdbApi';
import FilterBar from '../components/FilterBar';
import GridLayout from '../components/GridLayout';
import Pagination from '../components/Pagination';
import LayoutToggle from '../components/LayoutToggle';

interface FilterOptions {
  genre?: number;
  year?: number;
  sortBy?: string;
  voteAverageGte?: number;
  voteAverageLte?: number;
  withRuntimeGte?: number;
  withRuntimeLte?: number;
}

interface MoviesPageProps {
  onMovieClick: (movie: Movie) => void;
  onPlayTrailer: (movie: Movie) => void;
}

const MoviesPage: React.FC<MoviesPageProps> = ({ onMovieClick, onPlayTrailer }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({ sortBy: 'popularity.desc' });
  const [layout, setLayout] = useState<'grid' | 'horizontal'>('grid');

  useEffect(() => {
    loadMovies();
  }, [currentPage, filters, layout]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        sort_by: filters.sortBy || 'popularity.desc',
        ...(filters.genre && { with_genres: filters.genre }),
        ...(filters.year && { year: filters.year }),
        ...(filters.voteAverageGte && { 'vote_average.gte': filters.voteAverageGte }),
        ...(filters.voteAverageLte && { 'vote_average.lte': filters.voteAverageLte }),
        ...(filters.withRuntimeGte && { 'with_runtime.gte': filters.withRuntimeGte }),
        ...(filters.withRuntimeLte && { 'with_runtime.lte': filters.withRuntimeLte }),
      };

      const response = await tmdbApi.discoverMovies(params);
      setMovies(response.results);
      setTotalPages(Math.min(response.total_pages, 500)); 
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); 
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-r from-secondary to-accent p-3 rounded-lg">
          <Film className="w-8 h-8 text-dark" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Filmler</h1>
          <p className="text-gray-400 mt-1">
            Binlerce filmi keşfedin ve favorilerinizi bulun
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <FilterBar
          type="movie"
          onFilterChange={handleFilterChange}
          loading={loading}
        />
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>

      {!loading && movies.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            Sayfa {currentPage} / {totalPages} - Toplam {totalPages * 20} film
          </p>
        </div>
      )}

      <GridLayout
        items={movies}
        onItemClick={(item) => onMovieClick(item as Movie)}
        onPlayTrailer={(item) => onPlayTrailer(item as Movie)}
        loading={loading}
        type="movie"
        layout={layout}
      />

      {!loading && movies.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Film bulunamadı</h3>
          <p className="text-gray-400">
            Farklı filtreler deneyebilir veya başka bir arama terimini girin.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
