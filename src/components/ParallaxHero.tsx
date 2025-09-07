import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Info, Star } from 'lucide-react';
import { FadeIn, TypeWriter } from './AnimatedComponents';

interface Movie {
  id: number;
  title: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface ParallaxHeroProps {
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  onPlayTrailer: (movieId: number) => void;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ 
  movies, 
  onMovieSelect, 
  onPlayTrailer 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.4, 0.8]);

  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [movies.length]);

  if (movies.length === 0) {
    return (
      <div className="relative h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative h-screen overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 w-full h-[120%]"
      >
        <motion.img
          key={currentMovie.id}
          src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </motion.div>

      <motion.div
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"
      />

      <motion.div
        style={{ y: textY }}
        className="relative z-10 h-full flex items-center"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <FadeIn delay={0.2}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                <TypeWriter 
                  text={currentMovie.title} 
                  delay={0.08}
                  key={currentMovie.id}
                />
              </h1>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={20} fill="currentColor" />
                  <span className="text-white font-semibold">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-300">
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
                <span className="px-2 py-1 bg-red-600 text-white text-sm rounded">
                  HD
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.6}>
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed line-clamp-3">
                {currentMovie.overview}
              </p>
            </FadeIn>

            <FadeIn delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  onClick={() => onPlayTrailer(currentMovie.id)}
                  className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={24} fill="currentColor" />
                  <span>Fragmanı İzle</span>
                </motion.button>

                <motion.button
                  onClick={() => onMovieSelect(currentMovie)}
                  className="flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg backdrop-blur-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Info size={24} />
                  <span>Detayları Gör</span>
                </motion.button>
              </div>
            </FadeIn>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {movies.slice(0, 5).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute bottom-8 right-8 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm">Kaydır</span>
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ParallaxHero;
