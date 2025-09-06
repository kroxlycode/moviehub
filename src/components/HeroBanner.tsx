import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Info, Star } from 'lucide-react';
import { Movie, TVShow, getImageUrl } from '../services/tmdbApi';

interface HeroBannerProps {
  items: (Movie | TVShow)[];
  onItemClick: (item: Movie | TVShow) => void;
  onPlayTrailer: (item: Movie | TVShow) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ items, onItemClick, onPlayTrailer }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (!items.length) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-300">İçerik yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const title = 'title' in currentItem ? currentItem.title : currentItem.name;
  const releaseDate = 'release_date' in currentItem ? currentItem.release_date : currentItem.first_air_date;
  const backdropUrl = getImageUrl(currentItem.backdrop_path, 'backdrop', 'large');

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-overlay"></div>
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-secondary fill-current" />
                <span className="text-white font-semibold">
                  {currentItem.vote_average.toFixed(1)}
                </span>
              </div>
              {releaseDate && (
                <span className="text-gray-300">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
              <span className="px-2 py-1 bg-secondary/20 text-secondary text-sm rounded">
                {'title' in currentItem ? 'Film' : 'Dizi'}
              </span>
            </div>

            <p className="text-gray-200 text-lg mb-8 leading-relaxed line-clamp-3">
              {currentItem.overview}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onPlayTrailer(currentItem)}
                className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary/90 text-dark font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Fragman İzle</span>
              </button>
              
              <button
                onClick={() => onItemClick(currentItem)}
                className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 border border-white/30"
              >
                <Info className="w-5 h-5" />
                <span>Detaylar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-secondary scale-125'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {isAutoPlaying && items.length > 1 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
            Otomatik geçiş
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
