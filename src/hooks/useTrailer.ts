import { useState, useEffect } from 'react';
import { Movie, TVShow, Video, tmdbApi } from '../services/tmdbApi';

export const useTrailer = (item: Movie | TVShow | null) => {
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrailer = async () => {
    if (!item) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let videos: Video[] = [];
      
      if ('title' in item) {
        const response = await tmdbApi.getMovieVideos(item.id);
        videos = response.results;
      } else {
        const response = await tmdbApi.getTVVideos(item.id);
        videos = response.results;
      }
      
      const bestTrailer = findBestTrailer(videos);
      
      if (bestTrailer) {
        setTrailer(bestTrailer);
        setIsModalOpen(true);
      } else {
        setError('No trailer available');
      }
    } catch (err) {
      console.error('Error fetching trailer:', err);
      setError('Failed to load trailer');
    } finally {
      setIsLoading(false);
    }
  };

  const findBestTrailer = (videos: Video[]): Video | null => {
    if (!videos || videos.length === 0) return null;
    
    const preferredLangs = ['tr', 'en'];
    
    for (const lang of preferredLangs) {
      const officialInLang = videos.find(
        video => 
          video.type === 'Trailer' && 
          video.official && 
          video.iso_639_1 === lang
      );
      
      if (officialInLang) return officialInLang;
    }
    
    const anyOfficialTrailer = videos.find(
      video => video.type === 'Trailer' && video.official
    );
    
    const anyTrailer = videos.find(video => video.type === 'Trailer');
    
    return anyOfficialTrailer || anyTrailer || null;
  };

  return {
    trailer,
    isLoading,
    error,
    isModalOpen,
    openTrailer: fetchTrailer,
    closeTrailer: () => setIsModalOpen(false)
  };
};
