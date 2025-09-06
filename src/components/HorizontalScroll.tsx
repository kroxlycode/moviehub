import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, TVShow } from '../services/tmdbApi';
import MovieCard from './MovieCard';

interface HorizontalScrollProps {
  title: string;
  items?: (Movie | TVShow)[];
  onItemClick: (item: Movie | TVShow) => void;
  onPlayTrailer?: (item: Movie | TVShow) => void;
  loading?: boolean;
  cardSize?: 'small' | 'medium' | 'large';
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  title,
  items = [],
  onItemClick,
  onPlayTrailer,
  loading = false,
  cardSize = 'medium'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = cardSize === 'large' ? 400 : cardSize === 'medium' ? 320 : 240;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const SkeletonCard = () => (
    <div className={`${cardSize === 'large' ? 'w-48' : cardSize === 'medium' ? 'w-40' : 'w-32'} flex-shrink-0`}>
      <div className="aspect-[2/3] bg-gray-700 animate-pulse rounded-lg mb-2"></div>
      <div className="h-4 bg-gray-700 animate-pulse rounded mb-1"></div>
      <div className="h-3 bg-gray-700 animate-pulse rounded w-2/3"></div>
    </div>
  );

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-200 hover:scale-110"
              disabled={loading}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : items && items.length > 0 ? (
              // Actual content
              items.map((item) => (
                <MovieCard
                  key={item.id}
                  item={item}
                  onClick={onItemClick}
                  onPlayTrailer={onPlayTrailer}
                  size={cardSize}
                />
              ))
            ) : (
              // Empty state
              <div className="w-full text-center py-12">
                <p className="text-gray-400 text-lg">İçerik bulunamadı</p>
              </div>
            )}
          </div>

          {/* Gradient Overlays for scroll indication */}
          {!loading && items && items.length > 0 && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-dark to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-dark to-transparent pointer-events-none"></div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HorizontalScroll;
