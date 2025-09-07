import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import { ArrowLeft, Play, Share2, Star, Calendar, Clock, Globe, Users, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import { Movie, MovieDetails, Cast, Crew, tmdbApi, getImageUrl, Video } from '../services/tmdbApi';
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
  const [videos, setVideos] = useState<Video[]>([]);
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

      const [movieResponse, creditsResponse, similarResponse, videosResponse] = await Promise.all([
        tmdbApi.getMovieDetails(movieId),
        tmdbApi.getMovieCredits(movieId),
        tmdbApi.getSimilarMovies(movieId),
        tmdbApi.getMovieVideos(movieId)
      ]);

      setMovie(movieResponse);
      setCast(creditsResponse.cast.slice(0, 20));
      setCrew(creditsResponse.crew.slice(0, 10));
      setSimilarMovies(similarResponse.results.slice(0, 12));
      setVideos(videosResponse.results || []);
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
        <div className="animate-pulse space-y-8">
          {/* Backdrop Skeleton */}
          <div className="h-96 bg-gray-800 rounded-xl"></div>
          
          {/* Content Skeleton */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster Skeleton */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="aspect-[2/3] bg-gray-800 rounded-xl"></div>
            </div>
            
            {/* Details Skeleton */}
            <div className="flex-1 space-y-6">
              <div className="h-12 bg-gray-800 rounded w-3/4"></div>
              <div className="h-6 bg-gray-800 rounded w-1/2"></div>
              
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-800 rounded-lg w-32"></div>
                <div className="h-10 bg-gray-800 rounded-lg w-32"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-800 rounded w-4/6"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Bir Hata Oluştu</h2>
          <p className="text-gray-300 mb-6">
            {error || 'Film bilgileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Tekrar Dene
          </button>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Format release date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get director from crew
  const director = crew.find(member => member.job === 'Director');
  
  // Get writers from crew with unique IDs
  const writers = Array.from(new Map(
    crew
      .filter(member => 
        member.job === 'Writer' || 
        member.job === 'Screenplay' || 
        member.job === 'Story'
      )
      .map(writer => [writer.id, writer])
  ).values()) as Crew[];

  // Get genres as string
  const genresString = movie.genres?.map(genre => genre.name).join(', ') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Backdrop Image */}
      <div
        className="relative h-96 w-full bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          aria-label="Geri"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Movie Content */}
      <div className="container mx-auto px-4 py-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="relative group">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full rounded-xl shadow-2xl transform transition-transform group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-movie.png';
                }}
              />
              <button
                onClick={handlePlayTrailer}
                className="absolute inset-0 m-auto w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Fragmanı Oynat"
              >
                <Play className="w-8 h-8" />
              </button>
            </div>
            
            {/* Quick Info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Calendar className="w-4 h-4 text-yellow-500" />
                <span>{formatDate(movie.release_date)}</span>
              </div>
              
              {movie.runtime > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{movie.vote_average.toFixed(1)}/10 ({movie.vote_count.toLocaleString()} oy)</span>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <h4 className="font-semibold text-gray-200 mb-2">Türler</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <span 
                      key={genre.id}
                      className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold text-gray-200 mb-2">Paylaş</h4>
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Paylaş</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-gray-400 italic mb-4">"{movie.tagline}"</p>
              )}
              
              {/* Trailer Button */}
              <div className="flex flex-wrap gap-4 mt-6 mb-8">
                <button
                  onClick={handlePlayTrailer}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Fragmanı Oynat</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  <span>İzleme Listesine Ekle</span>
                </button>
              </div>
              
              {/* Overview */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Özet</h2>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
              
              {/* Movie Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900/50 p-6 rounded-xl">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Film Detayları</h3>
                  <div className="space-y-3">
                    {director && (
                      <div>
                        <span className="text-gray-400 block text-sm">Yönetmen</span>
                        <span className="text-white">{director.name}</span>
                      </div>
                    )}
                    
                    {writers.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Senaryo</h4>
                        <div className="flex flex-wrap gap-2">
                          {writers.slice(0, 3).map((writer, index) => (
                            <span key={writer.id} className="text-white">
                              {writer.name}{index < Math.min(writers.length - 1, 2) ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-gray-400 block text-sm">Tür</span>
                      <span className="text-white">{genresString}</span>
                    </div>
                    
                    {movie.production_countries.length > 0 && (
                      <div>
                        <span className="text-gray-400 block text-sm">Ülke</span>
                        <span className="text-white">
                          {movie.production_countries.map(c => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {movie.spoken_languages.length > 0 && (
                      <div>
                        <span className="text-gray-400 block text-sm">Dil</span>
                        <span className="text-white">
                          {movie.spoken_languages.map(lang => lang.english_name).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {movie.budget > 0 && (
                      <div>
                        <span className="text-gray-400 block text-sm">Bütçe</span>
                        <span className="text-white">
                          ${movie.budget.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {movie.revenue > 0 && (
                      <div>
                        <span className="text-gray-400 block text-sm">Hasılat</span>
                        <span className="text-white">
                          ${movie.revenue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Yapım Şirketleri</h3>
                  <div className="flex flex-wrap gap-4">
                    {movie.production_companies.map(company => (
                      <div key={company.id} className="flex flex-col items-center">
                        {company.logo_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`} 
                            alt={company.name}
                            className="h-12 w-auto object-contain grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">{company.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-400'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('cast')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cast'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-400'
              }`}
            >
              Oyuncular ve Ekip
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'similar'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-400'
              }`}
            >
              Benzer Filmler
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-12 bg-gray-900/50">
        <div className="container mx-auto px-4">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Cast Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Başrol Oyuncuları</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {cast.slice(0, 6).map((person) => (
                    <Link 
                      key={person.id} 
                      to={`/oyuncu/${person.id}`}
                      className="group"
                    >
                      <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                        <img
                          src={getImageUrl(person.profile_path, 'profile', 'medium')}
                          alt={person.name}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <span className="text-white font-medium text-sm">{person.character}</span>
                        </div>
                      </div>
                      <h4 className="text-white font-semibold text-sm truncate">{person.name}</h4>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setActiveTab('cast')}
                    className="text-red-500 hover:text-red-400 font-medium text-sm"
                  >
                    Tüm Oyuncuları Görüntüle →
                  </button>
                </div>
              </div>
              
              {/* Videos Section */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Videolar</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.slice(0, 2).map((video) => (
                      <div key={video.key} className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                          alt={video.name}
                          className="w-full h-full object-cover opacity-70"
                        />
                        <button
                          onClick={() => {
                            const videoUrl = `https://www.youtube.com/watch?v=${video.key}`;
                            window.open(videoUrl, '_blank');
                          }}
                          className="absolute inset-0 m-auto w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                          aria-label={`${video.name} oynat`}
                        >
                          <Play className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                          <h4 className="text-white font-medium">{video.name}</h4>
                          <p className="text-gray-400 text-sm">{video.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
