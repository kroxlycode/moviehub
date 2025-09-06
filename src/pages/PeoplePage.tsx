import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { Person, tmdbApi } from '../services/tmdbApi';
import GridLayout from '../components/GridLayout';
import Pagination from '../components/Pagination';
import LayoutToggle from '../components/LayoutToggle';

interface ActorsPageProps {
  onActorClick: (actor: Person) => void;
}

const ActorsPage: React.FC<ActorsPageProps> = ({ onActorClick }) => {
  const [actors, setActors] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [layout, setLayout] = useState<'grid' | 'horizontal'>('grid');

  useEffect(() => {
    if (searchQuery.trim()) {
      searchActors();
    } else {
      loadPopularActors();
    }
  }, [currentPage, searchQuery]);

  const loadPopularActors = async () => {
    try {
      setLoading(true);
      setIsSearching(false);
      
      // Load actors from popular movies and TV shows
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTVShows()
      ]);
      
      const actorsFromContent: Person[] = [];
      const processedActorIds = new Set<number>();
      
      // Get actors from popular movies
      for (const movie of moviesResponse.results.slice(0, 10)) {
        try {
          const credits = await tmdbApi.getMovieCredits(movie.id);
          credits.cast.slice(0, 6).forEach((actor: any) => {
            if (!processedActorIds.has(actor.id)) {
              processedActorIds.add(actor.id);
              actorsFromContent.push({
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
          console.error('Error loading movie credits:', error);
        }
      }
      
      // Get actors from popular TV shows
      for (const tvShow of tvResponse.results.slice(0, 10)) {
        try {
          const credits = await tmdbApi.getTVShowCredits(tvShow.id);
          credits.cast.slice(0, 6).forEach((actor: any) => {
            if (!processedActorIds.has(actor.id)) {
              processedActorIds.add(actor.id);
              actorsFromContent.push({
                id: actor.id,
                name: actor.name,
                profile_path: actor.profile_path,
                adult: false,
                known_for_department: 'Acting',
                known_for: [tvShow]
              });
            }
          });
        } catch (error) {
          console.error('Error loading TV credits:', error);
        }
      }
      
      // Sort by popularity and paginate
      const sortedActors = actorsFromContent
        .sort((a, b) => (b.known_for?.length || 0) - (a.known_for?.length || 0));
      
      const startIndex = (currentPage - 1) * 20;
      const endIndex = currentPage * 20;
      const paginatedActors = sortedActors.slice(startIndex, endIndex);
      
      setActors(paginatedActors);
      setTotalPages(Math.ceil(sortedActors.length / 20));
    } catch (error) {
      console.error('Error loading actors:', error);
      setActors([]);
    } finally {
      setLoading(false);
    }
  };

  const searchActors = async () => {
    try {
      setLoading(true);
      setIsSearching(true);
      
      const response = await tmdbApi.searchPeople(searchQuery, currentPage);
      // Filter only actors
      const actorsOnly = response.results.filter(person => 
        person.known_for_department === 'Acting'
      );
      setActors(actorsOnly);
      setTotalPages(Math.min(response.total_pages, 500));
    } catch (error) {
      console.error('Error searching actors:', error);
      setActors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      searchActors();
    } else {
      loadPopularActors();
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
          <Users className="w-8 h-8 text-dark" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Aktörler</h1>
          <p className="text-gray-400 mt-1">
            Favori oyuncularınızı keşfedin ve filmografilerini inceleyin
          </p>
        </div>
      </div>

      {/* Search Bar and Layout Toggle */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Aktör ara..."
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
        <LayoutToggle layout={layout} onLayoutChange={setLayout} />
      </div>

      {/* Results Info */}
      {!loading && actors.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {isSearching ? (
              <>\"{searchQuery}\" için sonuçlar - </>
            ) : (
              'Popüler aktörler - '
            )}
            Sayfa {currentPage} / {totalPages}
          </p>
        </div>
      )}

      {/* Actors Grid */}
      <GridLayout
        items={actors}
        onItemClick={(item) => onActorClick(item as Person)}
        loading={loading}
        type="person"
        layout={layout}
      />

      {/* Pagination */}
      {!loading && actors.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}

      {/* Empty State */}
      {!loading && actors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {isSearching ? 'Aktör bulunamadı' : 'Aktörler yükleniyor'}
          </h3>
          <p className="text-gray-400">
            {isSearching 
              ? 'Farklı arama terimleri deneyebilirsiniz.'
              : 'Popüler aktörler yükleniyor...'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ActorsPage;
