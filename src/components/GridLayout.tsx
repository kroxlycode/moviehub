import React from 'react';
import { Movie, TVShow, Person } from '../services/tmdbApi';
import MovieCard from './MovieCard';
import PersonCard from './PersonCard';

interface GridLayoutProps {
  items: (Movie | TVShow | Person)[];
  onItemClick: (item: Movie | TVShow | Person) => void;
  onPlayTrailer?: (item: Movie | TVShow) => void;
  loading?: boolean;
  type: 'movie' | 'tv' | 'person';
}

const GridLayout: React.FC<GridLayoutProps> = ({
  items,
  onItemClick,
  onPlayTrailer,
  loading = false,
  type
}) => {
  const SkeletonCard = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="aspect-[2/3] bg-gray-700 animate-pulse"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-700 animate-pulse rounded mb-2"></div>
        <div className="h-3 bg-gray-700 animate-pulse rounded w-2/3"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">İçerik bulunamadı</p>
        <p className="text-gray-500 text-sm mt-2">
          Farklı filtreler deneyebilir veya arama terimini değiştirebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => {
        if (type === 'movie') {
          return (
            <MovieCard
              key={item.id}
              item={item as Movie}
              onClick={onItemClick}
              onPlayTrailer={onPlayTrailer}
              size="large"
            />
          );
        } else if (type === 'tv') {
          return (
            <MovieCard
              key={item.id}
              item={item as TVShow}
              onClick={onItemClick}
              onPlayTrailer={onPlayTrailer}
              size="large"
            />
          );
        } else if (type === 'person') {
          return (
            <PersonCard
              key={item.id}
              person={item as Person}
              onClick={onItemClick}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default GridLayout;
