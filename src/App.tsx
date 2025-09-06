import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import HorizontalScroll from './components/HorizontalScroll';
import Layout from './components/Layout';
import Footer from './components/Footer';
import GitHubButton from './components/GitHubButton';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import ActorsPage from './pages/PeoplePage';
import SearchResultsPage from './pages/SearchResultsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowDetailPage from './pages/TVShowDetailPage';
import TrailerModal from './components/TrailerModal';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Movie, TVShow, Person, tmdbApi, setLanguage } from './services/tmdbApi';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [trendingItems, setTrendingItems] = useState<(Movie | TVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');

  // Detail page states
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedTVShowId, setSelectedTVShowId] = useState<number | null>(null);

  // Language effect
  useEffect(() => {
    setLanguage(language);
  }, [language]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [
          trendingResponse,
          popularMoviesResponse,
          popularTVResponse,
          topRatedResponse,
          nowPlayingResponse,
          upcomingResponse
        ] = await Promise.all([
          tmdbApi.getTrendingAll('week'),
          tmdbApi.getPopularMovies(),
          tmdbApi.getPopularTVShows(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getUpcomingMovies()
        ]);

        setTrendingItems(trendingResponse.results);
        setPopularMovies(popularMoviesResponse.results);
        setPopularTVShows(popularTVResponse.results);
        setTopRatedMovies(topRatedResponse.results);
        setNowPlayingMovies(nowPlayingResponse.results);
        setUpcomingMovies(upcomingResponse.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]); // Re-fetch when language changes

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleItemClick = (item: Movie | TVShow | Person, type?: 'movie' | 'tv' | 'person') => {
    if ('title' in item || type === 'movie') {
      setSelectedMovieId(item.id);
      setCurrentPage('movie-detail');
    } else if ('name' in item && 'first_air_date' in item || type === 'tv') {
      setSelectedTVShowId(item.id);
      setCurrentPage('tv-detail');
    } else if (type === 'person') {
      // Handle person click - future implementation
      console.log('Person clicked:', item);
    }
  };

  const handlePlayTrailer = async (item: Movie | TVShow) => {
    try {
      const title = 'title' in item ? item.title : item.name;
      const videos = 'title' in item 
        ? await tmdbApi.getMovieVideos(item.id)
        : await tmdbApi.getTVVideos(item.id);
      
      const trailer = videos.results.find((video: any) => 
        video.type === 'Trailer' && video.site === 'YouTube'
      );
      
      if (trailer) {
        setTrailerKey(trailer.key);
        setTrailerTitle(title);
        setShowTrailerModal(true);
      }
    } catch (error) {
      console.error('Error loading trailer:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <HeroBanner 
              items={trendingItems} 
              onItemClick={handleItemClick}
              onPlayTrailer={handlePlayTrailer}
            />
            
            <div className="space-y-8">
              <HorizontalScroll
                title={t('home.popularMovies')}
                items={popularMovies}
                onItemClick={handleItemClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.popularTVShows')}
                items={popularTVShows}
                onItemClick={handleItemClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.topRatedMovies')}
                items={topRatedMovies}
                onItemClick={handleItemClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.nowPlayingMovies')}
                items={nowPlayingMovies}
                onItemClick={handleItemClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.upcomingMovies')}
                items={upcomingMovies}
                onItemClick={handleItemClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
            </div>
          </>
        );
      
      case 'movies':
        return <MoviesPage onMovieClick={(movie) => handleItemClick(movie, 'movie')} onPlayTrailer={handlePlayTrailer} />;
      
      case 'tv':
        return <TVShowsPage onTVShowClick={(tvShow) => handleItemClick(tvShow, 'tv')} onPlayTrailer={handlePlayTrailer} />;
      
      case 'people':
        return <ActorsPage onActorClick={(person) => handleItemClick(person, 'person')} />;
      
      case 'search':
        return searchQuery ? (
          <SearchResultsPage 
            query={searchQuery}
            onBack={() => setCurrentPage('home')}
            onItemClick={handleItemClick}
            onPlayTrailer={handlePlayTrailer}
          />
        ) : null;
      
      case 'movie-detail':
        return selectedMovieId ? (
          <MovieDetailPage 
            movieId={selectedMovieId} 
            onBack={() => setCurrentPage('home')}
            onPlayTrailer={handlePlayTrailer}
          />
        ) : null;
      
      case 'tv-detail':
        return selectedTVShowId ? (
          <TVShowDetailPage 
            tvShowId={selectedTVShowId} 
            onBack={() => setCurrentPage('home')}
            onPlayTrailer={handlePlayTrailer}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <Header 
        onSearch={handleSearch}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onItemClick={handleItemClick}
      />
      
      <Layout>
        {renderCurrentPage()}
      </Layout>

      <Footer />
      <GitHubButton />

      {showTrailerModal && trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={trailerTitle}
          isOpen={showTrailerModal}
          onClose={() => {
            setShowTrailerModal(false);
            setTrailerKey(null);
            setTrailerTitle('');
          }}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
