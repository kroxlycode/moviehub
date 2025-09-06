import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Star, Film, Tv } from 'lucide-react';
import { Person, Movie, TVShow, tmdbApi, getImageUrl } from '../services/tmdbApi';
import GridLayout from '../components/GridLayout';

interface ActorDetailPageProps {
  actorId: number;
  onBack: () => void;
  onMovieClick: (movie: Movie) => void;
  onTVShowClick: (tvShow: TVShow) => void;
}

interface ActorDetails extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
}

interface ActorCredits {
  cast: any[];
  crew: any[];
}

const ActorDetailPage: React.FC<ActorDetailPageProps> = ({
  actorId,
  onBack,
  onMovieClick,
  onTVShowClick
}) => {
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [credits, setCredits] = useState<ActorCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActorDetails();
  }, [actorId]);

  const loadActorDetails = async () => {
    try {
      setLoading(true);
      
      const [actorResponse, movieCreditsResponse, tvCreditsResponse] = await Promise.all([
        tmdbApi.getPersonDetails(actorId),
        tmdbApi.getPersonMovieCredits(actorId),
        tmdbApi.getPersonTVCredits(actorId)
      ]);
      
      // Combine movie and TV credits
      const combinedCredits = {
        cast: [...movieCreditsResponse.cast, ...tvCreditsResponse.cast],
        crew: [...movieCreditsResponse.crew, ...tvCreditsResponse.crew]
      };
      
      setActor(actorResponse as ActorDetails);
      setCredits(combinedCredits);
    } catch (error) {
      console.error('Error loading actor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthday: string | null, deathday: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    const age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getMoviesAndTVShows = () => {
    if (!credits) return { movies: [], tvShows: [] };
    
    const movies: Movie[] = [];
    const tvShows: TVShow[] = [];
    
    credits.cast.forEach(item => {
      if ('title' in item) {
        movies.push(item as Movie);
      } else if ('name' in item) {
        tvShows.push(item as TVShow);
      }
    });
    
    return {
      movies: movies.sort((a, b) => new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime()),
      tvShows: tvShows.sort((a, b) => new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime())
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-gray-700 rounded mr-4"></div>
            <div className="h-8 bg-gray-700 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="aspect-[2/3] bg-gray-700 rounded-lg"></div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-12 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Aktör bulunamadı</h2>
          <button
            onClick={onBack}
            className="bg-secondary hover:bg-secondary/90 text-dark px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const { movies, tvShows } = getMoviesAndTVShows();
  const age = calculateAge(actor.birthday, actor.deathday);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Geri Dön</span>
      </button>

      {/* Actor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Profile Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <img
              src={getImageUrl(actor.profile_path, 'profile', 'large')}
              alt={actor.name}
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-profile.jpg';
              }}
            />
          </div>
        </div>

        {/* Actor Info */}
        <div className="lg:col-span-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {actor.name}
          </h1>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {actor.birthday && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-gray-400 text-sm">Doğum Tarihi</p>
                  <p className="text-white">
                    {formatDate(actor.birthday)}
                    {age && ` (${age} yaşında)`}
                  </p>
                </div>
              </div>
            )}

            {actor.place_of_birth && (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Doğum Yeri</p>
                  <p className="text-white">{actor.place_of_birth}</p>
                </div>
              </div>
            )}

            {actor.deathday && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Ölüm Tarihi</p>
                  <p className="text-white">{formatDate(actor.deathday)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-gray-400 text-sm">Meslek</p>
                <p className="text-white">{actor.known_for_department}</p>
              </div>
            </div>
          </div>

          {/* Biography */}
          {actor.biography && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Biyografi</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {actor.biography}
              </p>
            </div>
          )}

          {/* Also Known As */}
          {actor.also_known_as && actor.also_known_as.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">Diğer İsimleri</h3>
              <div className="flex flex-wrap gap-2">
                {actor.also_known_as.slice(0, 5).map((name, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movies Section */}
      {movies.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Film className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-white">
              Filmler ({movies.length})
            </h2>
          </div>
          <GridLayout
            items={movies}
            onItemClick={(item) => onMovieClick(item as Movie)}
            loading={false}
            type="movie"
            layout="horizontal"
          />
        </div>
      )}

      {/* TV Shows Section */}
      {tvShows.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Tv className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-white">
              Diziler ({tvShows.length})
            </h2>
          </div>
          <GridLayout
            items={tvShows}
            onItemClick={(item) => onTVShowClick(item as TVShow)}
            loading={false}
            type="tv"
            layout="horizontal"
          />
        </div>
      )}
    </div>
  );
};

export default ActorDetailPage;
