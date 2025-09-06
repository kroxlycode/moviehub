import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import HorizontalScroll from './components/HorizontalScroll';
import Layout from './components/Layout';
import Footer from './components/Footer';
import GitHubButton from './components/GitHubButton';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import PeoplePage from './pages/PeoplePage';
import SearchResultsPage from './pages/SearchResultsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowDetailPage from './pages/TVShowDetailPage';
import PersonDetailPage from './pages/PersonDetailPage';
import TrailerModal from './components/TrailerModal';
import { Movie, TVShow, Person, tmdbApi, setApiLanguage } from './services/tmdbApi';
import { ContentLanguageProvider, useContentLanguage, getApiLanguageCode } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppContent: React.FC = () => {
  const { contentLanguage } = useContentLanguage();
  const [currentPage, setCurrentPage] = useState('home');
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

  // Update API language when content language changes
  useEffect(() => {
    const apiLanguage = getApiLanguageCode(contentLanguage);
    setApiLanguage(apiLanguage);
  }, [contentLanguage]);


  // Fetch data on component mount and when language changes
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
  }, [contentLanguage]); // Fetch data on mount and when language changes

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
                title="Popüler Filmler"
                items={popularMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title="Popüler Diziler"
                items={popularTVShows}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title="En Çok Beğenilen Filmler"
                items={topRatedMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title="Vizyondaki Filmler"
                items={nowPlayingMovies}
                onItemClick={handleMovieClick}
                onPlayTrailer={handlePlayTrailer}
                loading={loading}
              />
              
              <HorizontalScroll
                title="Yakında Gelecek Filmler"
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

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <ContentLanguageProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/filmler" element={<MoviesPage />} />
            <Route path="/film/:id/:title?" element={<MovieDetailPage />} />
            <Route path="/diziler" element={<TVShowsPage />} />
            <Route path="/dizi/:id/:title?" element={<TVShowDetailPage />} />
            <Route path="/oyuncular" element={<PeoplePage />} />
            <Route path="/oyuncu/:id/:name?" element={<PersonDetailPage />} />
            <Route path="/ara" element={<SearchResultsPage />} />
              <SearchResultsPage onBack={() => window.history.back()} />
            } />
          </Routes>
        </ContentLanguageProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
