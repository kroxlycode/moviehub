import React, { useState, useEffect } from 'react';
import { Tv } from 'lucide-react';
import { TVShow, tmdbApi } from '../services/tmdbApi';
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
}

interface TVShowsPageProps {
  onTVShowClick: (tvShow: TVShow) => void;
  onPlayTrailer: (tvShow: TVShow) => void;
}

const TVShowsPage: React.FC<TVShowsPageProps> = ({ onTVShowClick, onPlayTrailer }) => {
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({ sortBy: 'popularity.desc' });
  const [layout, setLayout] = useState<'grid' | 'horizontal'>('grid');

  useEffect(() => {
    loadTVShows();
  }, [currentPage, filters]);

  const loadTVShows = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        sort_by: filters.sortBy || 'popularity.desc',
        ...(filters.genre && { with_genres: filters.genre }),
        ...(filters.year && { first_air_date_year: filters.year }),
        ...(filters.voteAverageGte && { 'vote_average.gte': filters.voteAverageGte }),
        ...(filters.voteAverageLte && { 'vote_average.lte': filters.voteAverageLte }),
      };

      const response = await tmdbApi.discoverTVShows(params);
      setTVShows(response.results);
      setTotalPages(Math.min(response.total_pages, 500)); // TMDb limits to 500 pages
    } catch (error) {
      console.error('Error loading TV shows:', error);
      setTVShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-r from-secondary to-accent p-3 rounded-lg">
          <Tv className="w-8 h-8 text-dark" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Diziler</h1>
          <p className="text-gray-400 mt-1">
            En iyi dizileri keşfedin ve izleme listenize ekleyin
          </p>
        </div>
      </div>

      {/* Filter Bar and Layout Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <FilterBar
          type="tv"
          onFilterChange={handleFilterChange}
          loading={loading}
        />
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>

      {/* Results Info */}
      {!loading && tvShows.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            Sayfa {currentPage} / {totalPages} - Toplam {totalPages * 20} dizi
          </p>
        </div>
      )}

      {/* TV Shows Grid */}
      <GridLayout
        items={tvShows}
        onItemClick={(item) => onTVShowClick(item as TVShow)}
        onPlayTrailer={(item) => onPlayTrailer(item as TVShow)}
        loading={loading}
        type="tv"
        layout={layout}
      />

      {/* Pagination */}
      {!loading && tvShows.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!loading && tvShows.length === 0 && (
        <div className="text-center py-12">
          <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Dizi bulunamadı</h3>
          <p className="text-gray-400">
            Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};

export default TVShowsPage;
