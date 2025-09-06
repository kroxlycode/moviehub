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
  
  return id ? (
    <MovieDetailPage 
      movieId={parseInt(id)} 
      onBack={handleBack}
      onPlayTrailer={handlePlayTrailer}
    />
  ) : null;
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
  
  return id ? (
    <TVShowDetailPage 
      tvShowId={parseInt(id)} 
      onBack={handleBack}
      onPlayTrailer={handlePlayTrailer}
    />
  ) : null;
};

const PersonDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => navigate(-1);
  
  return id ? (
    <PersonDetailPage 
      personId={parseInt(id)}
      onBack={handleBack}
    />
  ) : null;
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
    navigate(`/oyuncu/${person.id}/${person.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`);
  };
  
  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/ara/${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <Layout>
      <Header onSearch={handleSearch} />
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              onMovieClick={handleMovieClick}
              onTVShowClick={handleTVShowClick}
              onPersonClick={handlePersonClick}
            />
          } 
        />
        <Route 
          path="/filmler" 
          element={
            <MoviesPage 
              onMovieClick={handleMovieClick}
            />
          } 
        />
        <Route 
          path="/diziler" 
          element={
            <TVShowsPage 
              onTVShowClick={handleTVShowClick}
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
        <Route path="/oyuncu/:id/:name?" element={<PersonDetailPageWrapper />} />
        <Route 
          path="/ara/:query" 
          element={
            <SearchResultsPage 
              onMovieClick={handleMovieClick}
              onTVShowClick={handleTVShowClick}
              onPersonClick={handlePersonClick}
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
      </ContentLanguageProvider>
    </ThemeProvider>
  </Router>
);

export default AppWithProviders;
