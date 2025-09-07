import React, { useState } from 'react';
import { Star, Calendar, Play } from 'lucide-react';
import { Movie, TVShow, getImageUrl } from '../services/tmdbApi';
import TrailerModal from './TrailerModal';
import { useTrailer } from '../hooks/useTrailer';

interface MovieCardProps {
  item: Movie | TVShow;
  onClick: (item: Movie | TVShow) => void;
  onPlayTrailer?: (item: Movie | TVShow) => void;
  size?: 'small' | 'medium' | 'large';
}

const MovieCard: React.FC<MovieCardProps> = ({ item, onClick, onPlayTrailer, size = 'medium' }) => {
  const [showTrailerButton, setShowTrailerButton] = useState(false);
  const { trailer, isModalOpen, openTrailer, closeTrailer } = useTrailer(item);
  const title = 'title' in item ? item.title : item.name;
  
  const handlePlayTrailer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayTrailer) {
      onPlayTrailer(item);
    } else {
      openTrailer();
    }
  };
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const posterUrl = getImageUrl(item.poster_path, 'poster', size === 'large' ? 'large' : 'medium');

  const cardWidth = size === 'large' ? 'w-48 sm:w-56 md:w-64' : size === 'medium' ? 'w-40 sm:w-44 md:w-48 lg:w-52' : 'w-32 sm:w-36 md:w-40';
  const aspectRatio = 'aspect-[2/3]'; // Standard movie poster ratio

  return (
    <div className={`${cardWidth} flex-shrink-0 group cursor-pointer`}>
      <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
        <div className={`${aspectRatio} relative overflow-hidden`}>
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-poster.jpg';
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <button
            onClick={handlePlayTrailer}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary/90 hover:bg-secondary text-dark p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <Play className="w-6 h-6 fill-current" />
          </button>

          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
            <Star className="w-3 h-3 text-secondary fill-current" />
            <span className="text-white text-xs font-semibold">
              {item.vote_average.toFixed(1)}
            </span>
          </div>

          <div className="absolute top-2 left-2 bg-secondary/90 px-2 py-1 rounded text-dark text-xs font-semibold">
            {'title' in item ? 'Film' : 'Dizi'}
          </div>
        </div>

        <div 
          className="p-3 bg-gray-900/95 backdrop-blur-sm"
          onClick={() => onClick(item)}
        >
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          {releaseDate && (
            <div className="flex items-center text-gray-400 text-xs mb-2">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(releaseDate).getFullYear()}</span>
            </div>
          )}

          {size === 'large' && (
            <p className="text-gray-300 text-xs line-clamp-3 leading-relaxed">
              {item.overview}
            </p>
          )}
        </div>
      </div>
      
      <TrailerModal
        isOpen={isModalOpen}
        onClose={closeTrailer}
        videoKey={trailer?.key || null}
        title={'title' in item ? item.title : item.name}
      />
    </div>
  );
};

export default MovieCard;
