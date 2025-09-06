import React, { useState, useEffect } from 'react';
import { User, Search } from 'lucide-react';
import { Person, tmdbApi } from '../services/tmdbApi';
import GridLayout from '../components/GridLayout';
import Pagination from '../components/Pagination';

interface PeoplePageProps {
  onPersonClick: (person: Person) => void;
}

const PeoplePage: React.FC<PeoplePageProps> = ({ onPersonClick }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchPeople();
    } else {
      loadPopularPeople();
    }
  }, [currentPage, searchQuery]);

  const loadPopularPeople = async () => {
    try {
      setLoading(true);
      setIsSearching(false);
      
      // Since TMDb doesn't have a direct popular people endpoint, we'll use trending
      const response = await tmdbApi.searchPeople('a', currentPage); // Hack to get people
      
      // Alternative: Load popular people from movie credits
      const popularMoviesResponse = await tmdbApi.getPopularMovies();
      const peopleFromMovies: Person[] = [];
      
      // This is a workaround - in a real app, you might want to cache popular people
      for (const movie of popularMoviesResponse.results.slice(0, 5)) {
        try {
          const credits = await tmdbApi.getMovieCredits(movie.id);
          credits.cast.slice(0, 4).forEach(actor => {
            if (!peopleFromMovies.find(p => p.id === actor.id)) {
              peopleFromMovies.push({
                id: actor.id,
                name: actor.name,
                profile_path: actor.profile_path,
                adult: false,
                known_for_department: 'Acting',
                known_for: [movie]
              });
            }
          });
        } catch (error) {
          console.error('Error loading credits:', error);
        }
      }
      
      setPeople(peopleFromMovies);
      setTotalPages(10); // Arbitrary number for popular people
    } catch (error) {
      console.error('Error loading people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPeople = async () => {
    try {
      setLoading(true);
      setIsSearching(true);
      
      const response = await tmdbApi.searchPeople(searchQuery, currentPage);
      setPeople(response.results);
      setTotalPages(Math.min(response.total_pages, 500));
    } catch (error) {
      console.error('Error searching people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      searchPeople();
    } else {
      loadPopularPeople();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Auto-search when query is cleared
    if (!value.trim()) {
      setCurrentPage(1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-gradient-to-r from-secondary to-accent p-3 rounded-lg">
          <User className="w-8 h-8 text-dark" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Kişiler</h1>
          <p className="text-gray-400 mt-1">
            Favori oyuncularınızı ve yönetmenlerinizi keşfedin
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Oyuncu, yönetmen veya kişi ara..."
              className="w-full px-4 py-3 pl-12 pr-4 bg-dark-lighter/80 backdrop-blur-sm border border-gray-custom/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-secondary hover:bg-secondary/90 text-dark px-4 py-1.5 rounded-md font-medium transition-colors"
            >
              Ara
            </button>
          </div>
        </form>
      </div>

      {/* Results Info */}
      {!loading && people.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {isSearching ? (
              <>"{searchQuery}" için sonuçlar - </>
            ) : (
              'Popüler kişiler - '
            )}
            Sayfa {currentPage} / {totalPages}
          </p>
        </div>
      )}

      {/* People Grid */}
      <GridLayout
        items={people}
        onItemClick={(item) => onPersonClick(item as Person)}
        loading={loading}
        type="person"
      />

      {/* Pagination */}
      {!loading && people.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!loading && people.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {isSearching ? 'Kişi bulunamadı' : 'Kişiler yükleniyor'}
          </h3>
          <p className="text-gray-400">
            {isSearching 
              ? 'Farklı arama terimleri deneyebilirsiniz.'
              : 'Arama yaparak kişileri keşfedebilirsiniz.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PeoplePage;
