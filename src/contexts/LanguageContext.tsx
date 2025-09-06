import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  tr: {
    // Header
    'nav.home': 'Ana Sayfa',
    'nav.movies': 'Filmler',
    'nav.tvShows': 'Diziler',
    'nav.people': 'Kişiler',
    'search.placeholder': 'Film, dizi veya kişi ara...',
    
    // Home Page
    'home.popularMovies': 'Popüler Filmler',
    'home.popularTVShows': 'Popüler Diziler',
    'home.topRatedMovies': 'En Çok Oylanan Filmler',
    'home.nowPlayingMovies': 'Vizyondaki Filmler',
    'home.upcomingMovies': 'Yakında Gelenler',
    
    // Movie/TV Details
    'details.watchTrailer': 'Fragman İzle',
    'details.addToFavorites': 'Favorilere Ekle',
    'details.addToWatchlist': 'İzleme Listesi',
    'details.share': 'Paylaş',
    'details.overview': 'Özet',
    'details.cast': 'Oyuncular',
    'details.crew': 'Ekip',
    'details.similar': 'Benzer',
    'details.seasons': 'Sezonlar',
    'details.episodes': 'Bölümler',
    'details.status': 'Durum',
    'details.originalLanguage': 'Orijinal Dil',
    'details.firstAirDate': 'İlk Yayın',
    'details.lastAirDate': 'Son Yayın',
    'details.budget': 'Bütçe',
    'details.revenue': 'Hasılat',
    'details.runtime': 'Süre',
    'details.genres': 'Türler',
    'details.productionCompanies': 'Yapım Şirketleri',
    'details.networks': 'Yayın Kanalları',
    'details.creators': 'Yaratıcılar',
    
    // Common
    'common.loading': 'Yükleniyor...',
    'common.noResults': 'Sonuç bulunamadı',
    'common.error': 'Bir hata oluştu',
    'common.backButton': 'Geri Dön',
    'common.seeAll': 'Tümünü Gör',
    'common.year': 'Yıl',
    'common.rating': 'Puan',
    'common.votes': 'oy',
    'common.minutes': 'dk',
    'common.seasons': 'Sezon',
    'common.episodes': 'Bölüm',
    
    // Filters
    'filter.genre': 'Tür',
    'filter.year': 'Yıl',
    'filter.rating': 'Puan',
    'filter.sortBy': 'Sıralama',
    'filter.popularity': 'Popülerlik',
    'filter.releaseDate': 'Çıkış Tarihi',
    'filter.voteAverage': 'Ortalama Puan',
    'filter.all': 'Tümü',
    
    // Status
    'status.returning': 'Devam Ediyor',
    'status.ended': 'Sona Erdi',
    'status.canceled': 'İptal Edildi',
    'status.inProduction': 'Yapım Aşamasında',
    
    // Footer
    'footer.description': 'Film ve dizi keşfetmek için modern platform',
    'footer.links': 'Bağlantılar'
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.movies': 'Movies',
    'nav.tvShows': 'TV Shows',
    'nav.people': 'People',
    'search.placeholder': 'Search movies, TV shows or people...',
    
    // Home Page
    'home.popularMovies': 'Popular Movies',
    'home.popularTVShows': 'Popular TV Shows',
    'home.topRatedMovies': 'Top Rated Movies',
    'home.nowPlayingMovies': 'Now Playing',
    'home.upcomingMovies': 'Upcoming Movies',
    
    // Movie/TV Details
    'details.watchTrailer': 'Watch Trailer',
    'details.addToFavorites': 'Add to Favorites',
    'details.addToWatchlist': 'Add to Watchlist',
    'details.share': 'Share',
    'details.overview': 'Overview',
    'details.cast': 'Cast',
    'details.crew': 'Crew',
    'details.similar': 'Similar',
    'details.seasons': 'Seasons',
    'details.episodes': 'Episodes',
    'details.status': 'Status',
    'details.originalLanguage': 'Original Language',
    'details.firstAirDate': 'First Air Date',
    'details.lastAirDate': 'Last Air Date',
    'details.budget': 'Budget',
    'details.revenue': 'Revenue',
    'details.runtime': 'Runtime',
    'details.genres': 'Genres',
    'details.productionCompanies': 'Production Companies',
    'details.networks': 'Networks',
    'details.creators': 'Creators',
    
    // Common
    'common.loading': 'Loading...',
    'common.noResults': 'No results found',
    'common.error': 'An error occurred',
    'common.backButton': 'Go Back',
    'common.seeAll': 'See All',
    'common.year': 'Year',
    'common.rating': 'Rating',
    'common.votes': 'votes',
    'common.minutes': 'min',
    'common.seasons': 'Season',
    'common.episodes': 'Episode',
    
    // Filters
    'filter.genre': 'Genre',
    'filter.year': 'Year',
    'filter.rating': 'Rating',
    'filter.sortBy': 'Sort By',
    'filter.popularity': 'Popularity',
    'filter.releaseDate': 'Release Date',
    'filter.voteAverage': 'Vote Average',
    'filter.all': 'All',
    
    // Status
    'status.returning': 'Returning Series',
    'status.ended': 'Ended',
    'status.canceled': 'Canceled',
    'status.inProduction': 'In Production',
    
    // Footer
    'footer.description': 'Modern platform for discovering movies and TV shows',
    'footer.links': 'Links'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('tr'); // Varsayılan Türkçe

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
