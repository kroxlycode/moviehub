import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import HorizontalScroll from '../components/HorizontalScroll';
import { Movie, TVShow, tmdbApi } from '../services/tmdbApi';

interface HomePageProps {
  onPlayTrailer: (item: Movie | TVShow) => void;
}

export default function HomePage({ onPlayTrailer }: HomePageProps) {
  const navigate = useNavigate();
  const [trendingItems, setTrendingItems] = useState<(Movie | TVShow)[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingResponse, moviesResponse, tvResponse] = await Promise.all([
          tmdbApi.getTrending('week', 'all'),
          tmdbApi.getPopularMovies(),
          tmdbApi.getPopularTVShows()
        ]);
        
        // Filter out Person types from trending items
        const filteredTrending = trendingResponse.results.filter(
          (item): item is Movie | TVShow => 'title' in item || 'name' in item
        );
        setTrendingItems(filteredTrending);
        setPopularMovies(moviesResponse.results);
        setPopularTVShows(tvResponse.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleItemClick = (item: Movie | TVShow) => {
    const type = 'title' in item ? 'movie' : 'tv';
    navigate(`/${type === 'movie' ? 'film' : 'dizi'}/${item.id}`);
  };

  const handlePlayTrailer = (item: Movie | TVShow) => {
    const type = 'title' in item ? 'movie' : 'tv';
    navigate(`/${type === 'movie' ? 'film' : 'dizi'}/${item.id}?playTrailer=true`);
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen text-white">
      <main>
        <HeroBanner 
          items={trendingItems} 
          onItemClick={handleItemClick} 
          onPlayTrailer={onPlayTrailer} 
        />
        
        <section className="py-8">
          <HorizontalScroll
            title="Popüler Filmler"
            items={popularMovies}
            type="movie"
            onItemClick={handleItemClick}
            onPlayTrailer={onPlayTrailer}
            viewAllLink="/filmler"
          />
          
          <HorizontalScroll
            title="Popüler Diziler"
            items={popularTVShows}
            type="tv"
            onItemClick={handleItemClick}
            onPlayTrailer={onPlayTrailer}
            viewAllLink="/diziler"
          />
        </section>
      </main>
    </div>
  );
}
