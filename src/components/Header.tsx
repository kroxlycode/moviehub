import React, { useState } from 'react';
import { Menu, X, Film, Tv, User, Home } from 'lucide-react';
import SearchDropdown from './SearchDropdown';
import ContentLanguageSelector from './ContentLanguageSelector';
import { Movie, TVShow, Person } from '../services/tmdbApi';

interface HeaderProps {
  onSearch: (query: string) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onItemClick: (item: Movie | TVShow | Person, type: 'movie' | 'tv' | 'person') => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, currentPage, onNavigate, onItemClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'filmler', label: 'Filmler', icon: Film },
    { id: 'diziler', label: 'Diziler', icon: Tv },
    { id: 'oyuncular', label: 'Oyuncular', icon: User },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/95 to-dark/95 backdrop-blur-md border-b border-gray-custom/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-gradient-to-r from-secondary to-accent p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-dark" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">MovieHub</h1>
              <p className="text-xs text-gray-300">Film & Dizi Rehberi</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchDropdown 
              onItemClick={onItemClick} 
              onSearchPageClick={onSearch}
            />
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            
            <ContentLanguageSelector />
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="md:hidden mt-4 px-4 pb-4">
          <SearchDropdown
            onItemClick={onItemClick}
            onSearchPageClick={onSearch}
          />
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-custom/20 pt-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-secondary text-dark font-semibold'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              
              <div className="px-4 py-2">
                <div className="text-xs text-gray-400 mb-2">İçerik Dili</div>
                <ContentLanguageSelector />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
