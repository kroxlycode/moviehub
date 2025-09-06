import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Heart, Bookmark, Share2, Star, Calendar, Clock, Globe, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { TVShow, TVShowDetails, Cast, Crew, Season, Episode, tmdbApi, getImageUrl } from '../services/tmdbApi';
import { FadeIn, SlideInLeft, SlideInRight, CardHover, StaggerContainer, StaggerItem } from '../components/AnimatedComponents';
import LazyImage from '../components/LazyImage';
import WatchProviders from '../components/WatchProviders';
import MediaGallery from '../components/MediaGallery';

interface TVShowDetailPageProps {
  tvShowId: number;
  onBack: () => void;
  onPlayTrailer: (tvShow: TVShow) => void;
}

const TVShowDetailPage: React.FC<TVShowDetailPageProps> = ({ tvShowId, onBack, onPlayTrailer }) => {
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
  const [cast, setCast] = useState<Cast[]>([]);
  const [crew, setCrew] = useState<Crew[]>([]);
  const [similarTVShows, setSimilarTVShows] = useState<TVShow[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'seasons' | 'cast' | 'crew' | 'similar' | 'media' | 'watch'>('overview');
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadTVShowDetails();
  }, [tvShowId]);

  const loadTVShowDetails = async () => {
    try {
      setLoading(true);
      
      const [tvShowResponse, creditsResponse, similarResponse] = await Promise.all([
        tmdbApi.getTVShowDetails(tvShowId),
        tmdbApi.getTVShowCredits(tvShowId),
        tmdbApi.getSimilarTVShows(tvShowId)
      ]);

      setTVShow(tvShowResponse);
      setCast(creditsResponse.cast.slice(0, 20));
      setCrew(creditsResponse.crew.slice(0, 10));
      setSimilarTVShows(similarResponse.results.slice(0, 12));
    } catch (error) {
      console.error('Error loading TV show details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasonEpisodes = async (seasonNumber: number) => {
    if (!tvShow) return;
    
    try {
      setLoadingEpisodes(true);
      
      const seasonResponse = await tmdbApi.getSeasonDetails(tvShow.id, seasonNumber);
      setEpisodes(seasonResponse.episodes);
      setSelectedSeason(tvShow.seasons.find(s => s.season_number === seasonNumber) || null);
    } catch (error) {
      console.error('Error loading season episodes:', error);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const toggleSeasonExpansion = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
      loadSeasonEpisodes(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  const formatRuntime = (minutes: number[]) => {
    if (!minutes || minutes.length === 0) return 'Bilinmiyor';
    const avgRuntime = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    return `~${avgRuntime} dk`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Bilinmiyor';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Dizi detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Dizi bulunamadı</p>
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
          <LazyImage
            src={getImageUrl(tvShow.backdrop_path, 'backdrop', 'large')}
            alt={tvShow.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-20 pb-12">
          <div className="container mx-auto px-4">
            <FadeIn>
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
              <SlideInLeft className="flex-shrink-0">
                <CardHover>
                  <LazyImage
                    src={getImageUrl(tvShow.poster_path, 'poster', 'large')}
                    alt={tvShow.name}
                    className="w-80 h-auto rounded-2xl shadow-2xl mx-auto lg:mx-0"
                  />
                </CardHover>
              </SlideInLeft>

              {/* TV Show Info */}
              <SlideInRight className="flex-1 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">{tvShow.name}</h1>
                
                {tvShow.tagline && (
                  <p className="text-xl text-gray-300 italic mb-6">{tvShow.tagline}</p>
                )}

                {/* Rating & Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{tvShow.vote_average.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                    {tvShow.last_air_date && tvShow.status !== 'Returning Series' && (
                      <span> - {new Date(tvShow.last_air_date).getFullYear()}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(tvShow.episode_run_time)}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{tvShow.vote_count.toLocaleString()} oy</span>
                  </div>
                </div>

                {/* Status & Season Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    tvShow.status === 'Returning Series' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : tvShow.status === 'Ended'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {tvShow.status === 'Returning Series' ? 'Devam Ediyor' : 
                     tvShow.status === 'Ended' ? 'Sona Erdi' : tvShow.status}
                  </span>
                  
                  <span className="text-gray-300">
                    {tvShow.number_of_seasons} Sezon • {tvShow.number_of_episodes} Bölüm
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {tvShow.genres.map((genre) => (
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
                    onClick={() => onPlayTrailer(tvShow as TVShow)}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Fragman İzle</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Paylaş</span>
                  </button>
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Özet</h3>
                  <p className="text-gray-300 leading-relaxed">{tvShow.overview}</p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Durum:</span>
                    <span className="ml-2 text-white">{tvShow.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Orijinal Dil:</span>
                    <span className="ml-2 text-white">{tvShow.original_language.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">İlk Yayın:</span>
                    <span className="ml-2 text-white">{formatDate(tvShow.first_air_date)}</span>
                  </div>
                  {tvShow.last_air_date && (
                    <div>
                      <span className="text-gray-400">Son Yayın:</span>
                      <span className="ml-2 text-white">{formatDate(tvShow.last_air_date)}</span>
                    </div>
                  )}
                </div>
              </SlideInRight>
            </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-dark/50 backdrop-blur-sm border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Genel Bakış' },
              { id: 'seasons', label: 'Sezonlar' },
              { id: 'cast', label: 'Oyuncular' },
              { id: 'crew', label: 'Ekip' },
              { id: 'media', label: 'Medya' },
              { id: 'watch', label: 'Nerede İzlenir' },
              { id: 'similar', label: 'Benzer Diziler' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
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
              <h2 className="text-2xl font-bold mb-6">Dizi Hakkında</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <p className="text-gray-300 leading-relaxed text-lg mb-6">{tvShow.overview}</p>
                  
                  {tvShow.created_by && tvShow.created_by.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Yaratıcılar</h4>
                      <div className="flex flex-wrap gap-2">
                        {tvShow.created_by.map((creator: any) => (
                          <span key={creator.id} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                            {creator.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Yapım Şirketleri</h4>
                    <div className="space-y-2">
                      {tvShow.production_companies.slice(0, 5).map((company: any) => (
                        <div key={company.id} className="text-gray-300">
                          {company.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {tvShow.networks && tvShow.networks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Yayın Kanalları</h4>
                      <div className="space-y-2">
                        {tvShow.networks.map((network: any) => (
                          <div key={network.id} className="text-gray-300">
                            {network.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seasons' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Sezonlar</h2>
              <div className="space-y-4">
                {tvShow.seasons
                  .filter(season => season.season_number > 0)
                  .map((season) => (
                  <div key={season.id} className="bg-gray-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSeasonExpansion(season.season_number)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={getImageUrl(season.poster_path, 'poster', 'small')}
                          alt={season.name}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="text-left">
                          <h3 className="text-white font-semibold">{season.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {season.episode_count} bölüm
                            {season.air_date && ` • ${formatDate(season.air_date)}`}
                          </p>
                          {season.overview && (
                            <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                              {season.overview}
                            </p>
                          )}
                        </div>
                      </div>
                      {expandedSeasons.has(season.season_number) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSeasons.has(season.season_number) && (
                      <div className="border-t border-gray-700 p-4">
                        {loadingEpisodes ? (
                          <div className="text-center py-4">
                            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-400">Bölümler yükleniyor...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {episodes.map((episode) => (
                              <div key={episode.id} className="flex space-x-3 p-3 bg-gray-700 rounded-lg">
                                <img
                                  src={getImageUrl(episode.still_path, 'backdrop', 'small')}
                                  alt={episode.name}
                                  className="w-20 h-12 object-cover rounded flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-medium text-sm line-clamp-1">
                                    {episode.episode_number}. {episode.name}
                                  </h4>
                                  <p className="text-gray-400 text-xs mb-1">
                                    {episode.air_date && formatDate(episode.air_date)}
                                    {episode.runtime && ` • ${episode.runtime} dk`}
                                  </p>
                                  {episode.overview && (
                                    <p className="text-gray-300 text-xs line-clamp-2">
                                      {episode.overview}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <FadeIn>
              <h2 className="text-2xl font-bold text-white mb-6">Oyuncular</h2>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cast.map((person) => (
                  <StaggerItem key={person.id}>
                    <CardHover className="text-center">
                      <LazyImage
                        src={getImageUrl(person.profile_path, 'profile', 'medium')}
                        alt={person.name}
                        className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                      />
                      <h4 className="text-white font-semibold text-sm">{person.name}</h4>
                      <p className="text-gray-400 text-xs">{person.character}</p>
                    </CardHover>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeIn>
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

          {activeTab === 'media' && (
            <FadeIn>
              <MediaGallery
                tvId={tvShow.id}
                mediaType="tv"
              />
            </FadeIn>
          )}

          {activeTab === 'watch' && (
            <FadeIn>
              <WatchProviders
                tvId={tvShow.id}
                mediaType="tv"
              />
            </FadeIn>
          )}

          {activeTab === 'similar' && (
            <FadeIn>
              <h2 className="text-2xl font-bold text-white mb-6">Benzer Diziler</h2>
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similarTVShows.map((similarShow) => (
                  <StaggerItem key={similarShow.id}>
                    <CardHover className="cursor-pointer">
                      <LazyImage
                        src={getImageUrl(similarShow.poster_path, 'poster', 'medium')}
                        alt={similarShow.name}
                        className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                      />
                      <h4 className="text-white font-semibold text-sm line-clamp-2">{similarShow.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-gray-400 text-xs">{similarShow.vote_average.toFixed(1)}</span>
                      </div>
                    </CardHover>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeIn>
          )}
        </div>
      </div>
    </div>
  );
};

export default TVShowDetailPage;
