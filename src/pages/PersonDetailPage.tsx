import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import { tmdbApi } from '../services/tmdbApi';
import type { Person, Movie, TVShow } from '../services/tmdbApi';

interface PersonDetailPageProps {
  personId: number;
  onBack: () => void;
}

interface PersonDetailsExtended extends Omit<Person, 'profile_path' | 'known_for_department'> {
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  known_for_department: string;
  profile_path: string | null;
}

const PersonDetailPage: React.FC<PersonDetailPageProps> = ({ personId, onBack }) => {
  const [person, setPerson] = useState<PersonDetailsExtended | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: person ? person.name : 'Oyuncu Profili',
    description: person ? `${person.name} hakkında detaylı bilgiler, oynadığı filmler ve diziler. ${person.biography ? person.biography.substring(0, 150) + '...' : ''}` : 'Oyuncu profili sayfası',
    type: 'profile',
    image: person ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : undefined
  });
  
  useEffect(() => {
    const fetchPersonDetails = async () => {
      if (!personId) {
        setError('Geçersiz oyuncu kimliği');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const personData = await tmdbApi.getPersonDetails(personId);
        const [movieCredits, tvCredits] = await Promise.all([
          tmdbApi.getPersonMovieCredits(personId).catch(err => {
            console.error('Error fetching movie credits:', err);
            return { cast: [] };
          }),
          tmdbApi.getPersonTVCredits(personId).catch(err => {
            console.error('Error fetching TV credits:', err);
            return { cast: [] };
          })
        ]);
        
        setPerson(personData);
        
        const personMovies = (movieCredits?.cast || [])
          .map((movie: Movie) => ({
            ...movie,
            release_date: movie.release_date || '',
            title: movie.title || 'Bilinmeyen Film',
            poster_path: movie.poster_path || ''
          }))
          .sort((a: Movie, b: Movie) => {
            const dateA = new Date(a.release_date || 0);
            const dateB = new Date(b.release_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
        
        const personTVShows = (tvCredits?.cast || [])
          .map((show: TVShow) => ({
            ...show,
            first_air_date: show.first_air_date || '',
            name: show.name || 'Bilinmeyen Dizi',
            poster_path: show.poster_path || ''
          }))
          .sort((a: TVShow, b: TVShow) => {
            const dateA = new Date(a.first_air_date || 0);
            const dateB = new Date(b.first_air_date || 0);
            return dateB.getTime() - dateA.getTime();
          });
        
        setMovies(personMovies);
        setTVShows(personTVShows);
      } catch (error) {
        console.error('Error fetching person details:', error);
        setError('Oyuncu bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonDetails();
  }, [personId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="container mx-auto py-8">
          <button 
            onClick={onBack}
            className="flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </button>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Hata Oluştu</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Kişi bulunamadı</h2>
          <p className="mt-2 text-gray-400">Üzgünüz, aradığınız kişiye ulaşılamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center text-white mb-6 hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Geri Dön
        </button>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.name}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="bg-gray-800 rounded-lg aspect-[2/3] flex items-center justify-center text-gray-400">
                <span>Resim yok</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{person.name}</h1>
            
            {person.biography && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Biyografi</h2>
                <p className="text-gray-300">
                  {person.biography || 'Biyografi bilgisi bulunamadı.'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {person.birthday && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Doğum Tarihi</h3>
                  <p>{new Date(person.birthday).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              
              {person.place_of_birth && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Doğum Yeri</h3>
                  <p>{person.place_of_birth}</p>
                </div>
              )}
              
              {person.deathday && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Ölüm Tarihi</h3>
                  <p>{new Date(person.deathday).toLocaleDateString('tr-TR')}</p>
                </div>
              )}
              
              {person.known_for_department && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Bilinen Departman</h3>
                  <p>{person.known_for_department}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {movies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Filmler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.slice(0, 12).map((movie) => (
                <div key={movie.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Resim yok</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold truncate">{movie.title}</h3>
                    <p className="text-sm text-gray-400">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Bilinmiyor'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {tvShows.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Diziler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tvShows.slice(0, 12).map((show) => (
                <div key={show.id} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform">
                  {show.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                      alt={show.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Resim yok</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold truncate">{show.name}</h3>
                    <p className="text-sm text-gray-400">
                      {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Bilinmiyor'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonDetailPage;
