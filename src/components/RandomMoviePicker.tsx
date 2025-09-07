import React, { useState } from 'react';
import { Shuffle, Dice6, Filter } from 'lucide-react';
import { tmdbApi, Movie, TVShow } from '../services/tmdbApi';

interface RandomMoviePickerProps {
  onItemClick: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
}

const RandomMoviePicker: React.FC<RandomMoviePickerProps> = ({ onItemClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [showRoulette, setShowRoulette] = useState(false);

  const genres = [
    { id: 28, name: 'Aksiyon' },
    { id: 12, name: 'Macera' },
    { id: 16, name: 'Animasyon' },
    { id: 35, name: 'Komedi' },
    { id: 80, name: 'Suç' },
    { id: 99, name: 'Belgesel' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Aile' },
    { id: 14, name: 'Fantastik' },
    { id: 36, name: 'Tarih' },
    { id: 27, name: 'Korku' },
    { id: 10402, name: 'Müzik' },
    { id: 9648, name: 'Gizem' },
    { id: 10749, name: 'Romantik' },
    { id: 878, name: 'Bilim Kurgu' },
    { id: 10770, name: 'TV Film' },
    { id: 53, name: 'Gerilim' },
    { id: 10752, name: 'Savaş' },
    { id: 37, name: 'Western' }
  ];

  const getRandomItem = async () => {
    setIsLoading(true);
    try {
      const randomPage = Math.floor(Math.random() * 20) + 1;
      
      let response;
      if (selectedGenre) {
        const params = {
          page: randomPage,
          with_genres: selectedGenre,
          sort_by: 'popularity.desc',
          vote_average_gte: 6.0
        };
        response = mediaType === 'movie' 
          ? await tmdbApi.discoverMovies(params)
          : await tmdbApi.discoverTVShows(params);
      } else {
        response = mediaType === 'movie'
          ? await tmdbApi.getPopularMovies(randomPage)
          : await tmdbApi.getPopularTVShows(randomPage);
      }

      if (response.results && response.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.results.length);
        const randomItem = response.results[randomIndex];
        onItemClick(randomItem, mediaType);
      }
    } catch (error) {
      console.error('Rastgele içerik alınırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRoulette = () => {
    setShowRoulette(true);
    
    let spins = 0;
    const maxSpins = 20;
    const interval = setInterval(() => {
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      setSelectedGenre(randomGenre.id);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(interval);
        setTimeout(() => {
          setShowRoulette(false);
          getRandomItem();
        }, 500);
      }
    }, 100);
  };

  const selectedGenreName = selectedGenre 
    ? genres.find(g => g.id === selectedGenre)?.name 
    : null;

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Dice6 className="text-purple-400" />
            Ne İzlesem?
          </h3>
          <p className="text-gray-300">
            Karar veremiyorsan, biz seçelim!
          </p>
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={() => setMediaType('movie')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mediaType === 'movie'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Film
          </button>
          <button
            onClick={() => setMediaType('tv')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mediaType === 'tv'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Dizi
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Filter size={16} />
            <span className="text-sm">Tür Seçimi (İsteğe Bağlı)</span>
          </div>
          
          <div className="max-w-md mx-auto">
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Tüm Türler</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {selectedGenreName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
              <span>Seçili: {selectedGenreName}</span>
              <button
                onClick={() => setSelectedGenre(null)}
                className="hover:text-white"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={getRandomItem}
            disabled={isLoading || showRoulette}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Seçiliyor...</span>
              </>
            ) : (
              <>
                <Shuffle size={20} />
                <span>Rastgele Seç</span>
              </>
            )}
          </button>

          <button
            onClick={startRoulette}
            disabled={isLoading || showRoulette}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {showRoulette ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Rulette Çeviriyor...</span>
              </>
            ) : (
              <>
                <Dice6 size={20} />
                <span>Tür Ruleti</span>
              </>
            )}
          </button>
        </div>

        {showRoulette && selectedGenreName && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-center gap-2 text-yellow-300">
              <Dice6 className="animate-spin" />
              <span className="text-lg font-semibold animate-pulse">
                {selectedGenreName}
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <p>💡 İpucu: Tür seçmezseniz popüler içeriklerden rastgele seçeriz</p>
          <p>🎯 Sadece 6.0+ puan alan kaliteli içerikler önerilir</p>
        </div>
      </div>
    </div>
  );
};

export default RandomMoviePicker;
