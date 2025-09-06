import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Bookmark, Share2, Star, Calendar, Clock, Globe, Users, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import { Movie, MovieDetails, Cast, Crew, tmdbApi, getImageUrl } from '../services/tmdbApi';

interface MovieDetailPageProps {
  movieId: number;
  onBack: () => void;
  onPlayTrailer: (movie: Movie) => void;
}

const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ movieId, onBack, onPlayTrailer }) => {
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'crew' | 'similar'>('overview');
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);

      const [movieResponse, creditsResponse, similarResponse, videosResponse] = await Promise.all([
        tmdbApi.getMovieDetails(movieId),
        tmdbApi.getMovieCredits(movieId),
        tmdbApi.getSimilarMovies(movieId),
        tmdbApi.getMovieVideos(movieId)
      ]);

      // Find trailer
      const trailer = videosResponse.results.find(
        (video: any) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      if (trailer) {
        setTrailerKey(trailer.key);
      }

      setMovie(movieResponse);
      setCast(creditsResponse.cast.slice(0, 20));
      setCrew(creditsResponse.crew.slice(0, 10));
      setSimilarMovies(similarResponse.results.slice(0, 12));
    } catch (error) {
      console.error('Error loading movie details:', error);
      toast.error('Film detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrailer = () => {
    if (trailerKey) {
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
    } else {
      toast.info('Bu film için fragman bulunamadı');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: movie?.title || 'Film',
      text: movie?.overview || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Paylaşım hatası:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Bağlantı panoya kopyalandı!');
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}dk`;
  };

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Film detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Film bulunamadı</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.backdrop_path, 'backdrop', 'large')}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-20 pb-12">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-secondary transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Geri Dön</span>
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img
                  src={getImageUrl(movie.poster_path, 'poster', 'large')}
                  alt={movie.title}
                  className="w-80 h-auto rounded-2xl shadow-2xl mx-auto lg:mx-0"
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{movie.title}</h1>

                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic mb-6">{movie.tagline}</p>
                )}

                {/* Rating & Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.release_date).getFullYear()}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{movie.vote_count.toLocaleString()} oy</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-yellow-500/20 text-primary border border-primary/30 rounded-full text-sm text-white font-semibold"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <button
                    onClick={handlePlayTrailer}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    disabled={!trailerKey}
                  >
                    <Play className="w-5 h-5" />
                    <span>Fragman İzle</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Paylaş</span>
                  </button>
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Özet</h3>
                  <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Durum:</span>
                    <span className="ml-2 text-white">{movie.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Orijinal Dil:</span>
                    <span className="ml-2 text-white">{movie.original_language.toUpperCase()}</span>
                  </div>
                  {movie.budget > 0 && (
                    <div>
                      <span className="text-gray-400">Bütçe:</span>
                      <span className="ml-2 text-white">{formatBudget(movie.budget)}</span>
                    </div>
                  )}
                  {movie.revenue > 0 && (
                    <div>
                      <span className="text-gray-400">Hasılat:</span>
                      <span className="ml-2 text-white">{formatBudget(movie.revenue)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-dark/50 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Genel Bakış' },
              { id: 'cast', label: 'Oyuncular' },
              { id: 'crew', label: 'Ekip' },
              { id: 'similar', label: 'Benzer Filmler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-6">Film Hakkında</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Yapım Şirketleri</h4>
                    <div className="space-y-2">
                      {movie.production_companies.slice(0, 5).map((company: any) => (
                        <div key={company.id} className="text-gray-300">
                          {company.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Oyuncular</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cast.map((person) => (
                  <div key={person.id} className="text-center">
                    <img
                      src={getImageUrl(person.profile_path, 'profile', 'medium')}
                      alt={person.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                    />
                    <h4 className="text-white font-semibold text-sm">{person.name}</h4>
                    <p className="text-gray-400 text-xs">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'crew' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Ekip</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crew.map((person) => (
                  <div key={`${person.id}-${person.job}`} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                    <img
                      src={getImageUrl(person.profile_path, 'profile', 'small')}
                      alt={person.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{person.name}</h4>
                      <p className="text-gray-400 text-sm">{person.job}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'similar' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Benzer Filmler</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similarMovies.map((similarMovie) => (
                  <div key={similarMovie.id} className="cursor-pointer group">
                    <img
                      src={getImageUrl(similarMovie.poster_path, 'poster', 'medium')}
                      alt={similarMovie.title}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="text-white font-semibold text-sm line-clamp-2">{similarMovie.title}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-gray-400 text-xs">{similarMovie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
