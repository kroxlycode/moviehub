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
import ActorDetailPage from './pages/ActorDetailPage';
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
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | Person | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'movie' | 'tv' | 'person' | null>(null);

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

  const handleItemClick = (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    
    if (type === 'movie') {
      setCurrentPage('movie-detail');
    } else if (type === 'tv') {
      setCurrentPage('tv-detail');
    } else if (type === 'person') {
      setCurrentPage('actor-detail');
    }
  };

  // Wrapper functions for HorizontalScroll components
  const handleMovieClick = (item: Movie | TVShow) => {
    if ('title' in item) {
      handleItemClick(item, 'movie');
    } else {
      handleItemClick(item, 'tv');
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
              onItemClick={handleMovieClick}
              onPlayTrailer={handlePlayTrailer}
            />
            
            <div className="space-y-8">
              <HorizontalScroll
                title={t('home.popularMovies')}
                items={popularMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.popularTVShows')}
                items={popularTVShows}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.topRatedMovies')}
                items={topRatedMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.nowPlayingMovies')}
                items={nowPlayingMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title={t('home.upcomingMovies')}
                items={upcomingMovies}
                onItemClick={handleMovieClick}
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
        return selectedItem && selectedItemType === 'movie' ? (
          <MovieDetailPage 
            movieId={selectedItem.id}
            onBack={() => setCurrentPage('home')}
            onPlayTrailer={handlePlayTrailer}
          />
        ) : null;
      
      case 'tv-detail':
        return selectedItem && selectedItemType === 'tv' ? (
          <TVShowDetailPage 
            tvShowId={selectedItem.id}
            onBack={() => setCurrentPage('home')}
            onPlayTrailer={handlePlayTrailer}
          />
        ) : null;
      
      case 'actor-detail':
        return selectedItem && selectedItemType === 'person' ? (
          <ActorDetailPage 
            actorId={selectedItem.id}
            onBack={() => setCurrentPage('people')}
            onMovieClick={(movie) => handleItemClick(movie, 'movie')}
            onTVShowClick={(tvShow) => handleItemClick(tvShow, 'tv')}
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
