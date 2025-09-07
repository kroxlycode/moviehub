import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

// Import types and API
import type { Movie, TVShow, Person, Video } from './services/tmdbApi';
import { tmdbApi } from './services/tmdbApi';

// Import contexts
import { ContentLanguageProvider, useContentLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Import pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import PeoplePage from './pages/PeoplePage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowDetailPage from './pages/TVShowDetailPage';
import PersonDetailPage from './pages/PersonDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import Layout from './components/Layout';

import GitHubButton from './components/GitHubButton';

// Wrapper components to handle route params
const MovieDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => navigate(-1);
  
  const handlePlayTrailer = async (movie: Movie) => {
    try {
      const videos = await tmdbApi.getMovieVideos(movie.id);
      const trailer = videos.results.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        toast.info('Fragman bulunamadı');
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      toast.error('Fragman yüklenirken bir hata oluştu');
    }
  };
  
  if (!id) return null;
  
  // Create a mock movie object with just the ID for the play trailer handler
  const movie: Movie = {
    id: parseInt(id),
    title: '',
    poster_path: '',
    overview: '',
    release_date: '',
    vote_average: 0,
    vote_count: 0,
    backdrop_path: '',
    genre_ids: [],
    original_language: '',
    original_title: '',
    popularity: 0,
    video: false,
    adult: false
  };
  
  return (
    <MovieDetailPage 
      movieId={parseInt(id)} 
      onBack={handleBack}
      onPlayTrailer={() => handlePlayTrailer(movie)}
    />
  );
};

const TVShowDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => navigate(-1);
  
  const handlePlayTrailer = async (tvShow: TVShow) => {
    try {
      const videos = await tmdbApi.getTVVideos(tvShow.id);
      const trailer = videos.results.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        toast.info('Fragman bulunamadı');
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      toast.error('Fragman yüklenirken bir hata oluştu');
    }
  };
  
  if (!id) return null;
  
  // Create a mock TV show object with just the ID for the play trailer handler
  const tvShow: TVShow = {
    id: parseInt(id),
    name: '',
    poster_path: '',
    overview: '',
    first_air_date: '',
    vote_average: 0,
    vote_count: 0,
    backdrop_path: '',
    genre_ids: [],
    original_language: '',
    original_name: '',
    popularity: 0,
    adult: false
  };
  
  return (
    <TVShowDetailPage 
      tvShowId={parseInt(id)} 
      onBack={handleBack}
      onPlayTrailer={() => handlePlayTrailer(tvShow)}
    />
  );
};

const PersonDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => navigate(-1);
  
  if (!id) {
    navigate('/oyuncular');
    return null;
  }
  
  return (
    <PersonDetailPage 
      personId={parseInt(id, 10)}
      onBack={handleBack}
    />
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const { contentLanguage } = useContentLanguage();
  
  const handleMovieClick = (movie: Movie) => {
    navigate(`/film/${movie.id}/${movie.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`);
  };
  
  const handleTVShowClick = (tvShow: TVShow) => {
    navigate(`/dizi/${tvShow.id}/${tvShow.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`);
  };
  
  const handlePersonClick = (person: Person) => {
    navigate(`/oyuncu/${person.id}`);
  };
  
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/ara/${encodeURIComponent(query)}`);
    }
  };
  
  const [currentPage, setCurrentPage] = useState('home');
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'home') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };
  
  const handleItemClick = (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => {
    if (type === 'movie') {
      handleMovieClick(item as Movie);
    } else if (type === 'tv') {
      handleTVShowClick(item as TVShow);
    } else if (type === 'person') {
      handlePersonClick(item as Person);
    }
  };

  const handlePlayTrailer = async (item: Movie | TVShow) => {
    const type = 'title' in item ? 'movie' : 'tv';
    try {
      const videos = type === 'movie' 
        ? await tmdbApi.getMovieVideos(item.id)
        : await tmdbApi.getTVVideos(item.id);
      
      const trailer = videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        toast.info('Fragman bulunamadı');
      }
    } catch (error) {
      console.error('Error playing trailer:', error);
      toast.error('Fragman yüklenirken bir hata oluştu');
    }
  };

  return (
    <Layout>
      <Header 
        onSearch={handleSearch} 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onItemClick={handleItemClick}
      />
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage onPlayTrailer={handlePlayTrailer} />
          } 
        />
        <Route 
          path="/filmler" 
          element={
            <MoviesPage 
              onMovieClick={handleMovieClick}
              onPlayTrailer={handlePlayTrailer}
            />
          } 
        />
        <Route 
          path="/diziler" 
          element={
            <TVShowsPage 
              onTVShowClick={handleTVShowClick}
              onPlayTrailer={handlePlayTrailer}
            />
          } 
        />
        <Route 
          path="/oyuncular" 
          element={
            <PeoplePage 
              onPersonClick={handlePersonClick}
            />
          } 
        />
        <Route path="/film/:id/:title?" element={<MovieDetailPageWrapper />} />
        <Route path="/dizi/:id/:title?" element={<TVShowDetailPageWrapper />} />
        <Route path="/oyuncu/:id" element={<PersonDetailPageWrapper />} />
        <Route 
          path="/ara/:query" 
          element={
            <SearchResultsPage 
              query={''} // This will be set by the route param
              onBack={() => navigate(-1)}
              onItemClick={handleItemClick}
              onPlayTrailer={handlePlayTrailer}
            />
          } 
        />
      </Routes>
      <Footer />
    </Layout>
  );
};

const AppWithProviders: React.FC = () => (
  <Router>
    <ThemeProvider>
      <ContentLanguageProvider>
        <App />
        <GitHubButton />
      </ContentLanguageProvider>
    </ThemeProvider>
  </Router>
);

export default AppWithProviders;
