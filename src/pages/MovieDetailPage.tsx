import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import { ArrowLeft, Play, Share2, Star, Calendar, Clock, Globe, Users, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import { Movie, MovieDetails, Cast, Crew, tmdbApi, getImageUrl } from '../services/tmdbApi';
import TrailerModal from '../components/TrailerModal';
import { useTrailer } from '../hooks/useTrailer';

interface MovieDetailPageProps {
  movieId: number;
  onBack?: () => void;
  onPlayTrailer?: (movie: any) => void;
}

const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ movieId, onBack, onPlayTrailer }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'crew' | 'similar'>('overview');
  
  // Use the useTrailer hook
  const { trailer, isModalOpen, openTrailer, closeTrailer } = useTrailer(movieId ? { id: movieId, title: movie?.title || '' } as any : null);

  // Set SEO metadata
  useSeo({
    title: movie ? `${movie.title} (${new Date(movie.release_date).getFullYear()})` : 'Film Detayı',
    description: movie ? `${movie.title} filmi hakkında detaylı bilgiler, oyuncu kadrosu, yönetmen ve daha fazlası. ${movie.tagline || ''}` : 'Film detay sayfası',
    type: 'video.movie',
    image: movie ? getImageUrl(movie.poster_path, 'poster', 'original') : undefined
  });
  
  // Update trailer when movie changes
  useEffect(() => {
    if (movie) {
      openTrailer();
    }
  }, [movie]);

  useEffect(() => {
    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);

      const [movieResponse, creditsResponse, similarResponse] = await Promise.all([
        tmdbApi.getMovieDetails(movieId),
        tmdbApi.getMovieCredits(movieId),
        tmdbApi.getSimilarMovies(movieId)
      ]);

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
    openTrailer();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleShare = () => {
    if (!movie) return;
    
    if (navigator.share) {
      navigator.share({
        title: movie.title || 'Movie',
        text: `Check out this movie: ${movie.title || ''}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!movie) {
    return <div>No movie found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Backdrop Image */}
      <div
        className="relative h-96 w-full bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Movie Content */}
      <div className="container mx-auto px-4 py-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-movie.png';
              }}
            />
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
                  <Link 
                    key={person.id} 
                    to={`/oyuncu/${person.id}`}
                    className="text-center hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={getImageUrl(person.profile_path, 'profile', 'medium')}
                      alt={person.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                    />
                    <h4 className="text-white font-semibold text-sm">{person.name}</h4>
                    <p className="text-gray-400 text-xs">{person.character}</p>
                  </Link>
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
                  <Link 
                    key={similarMovie.id} 
                    to={`/film/${similarMovie.id}/${similarMovie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                    className="group block"
                  >
                    <div className="overflow-hidden rounded-lg mb-2">
                      <img
                        src={getImageUrl(similarMovie.poster_path, 'poster', 'medium')}
                        alt={similarMovie.title}
                        className="w-full aspect-[2/3] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-secondary transition-colors">
                      {similarMovie.title}
                    </h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-gray-400 text-xs">{similarMovie.vote_average.toFixed(1)}</span>
                    </div>
                  </Link>
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
