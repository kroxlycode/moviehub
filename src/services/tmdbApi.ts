const API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'YOUR_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';

// Dynamic language support - will be set by API functions
let currentApiLanguage = 'tr-TR';

// Set the current API language
export const setApiLanguage = (language: string) => {
  currentApiLanguage = language;
};

// Get the current API language
export const getApiLanguage = () => currentApiLanguage;

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Image size configurations
export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original'
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original'
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original'
  }
};

// Type definitions
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  original_name: string;
  popularity: number;
  adult: boolean;
}

export interface TVShowDetails extends TVShow {
  created_by: any[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: any;
  next_episode_to_air: any;
  networks: any[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  production_companies: any[];
  production_countries: any[];
  seasons: Season[];
  spoken_languages: any[];
  status: string;
  tagline: string;
  type: string;
}

export interface Season {
  id: number;
  air_date: string;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface Episode {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  adult: boolean;
  known_for_department: string;
  known_for: (Movie | TVShow)[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
  iso_639_1: string;
  iso_3166_1: string;
  size?: number;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: Genre[];
  production_companies: any[];
  production_countries: any[];
  spoken_languages: any[];
  imdb_id: string;
  videos?: {
    results: Video[];
  };
}

export interface Crew {
  id: number;
  credit_id: string;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
  gender: number;
  popularity: number;
}

export interface TVDetails extends TVShow {
  created_by: any[];
  episode_run_time: number[];
  genres: Genre[];
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  networks: any[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: any[];
  status: string;
  type: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  credit_id: string;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// API Response types
export interface ApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Enhanced fetch with retry logic
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, delay = 1000): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      cache: 'default'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries <= 0) {
      console.error('Max retries reached. Last error:', error);
      throw error;
    }
    
    console.warn(`Retrying... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
};

// Utility function to build API URLs
const buildUrl = (endpoint: string, params: Record<string, any> = {}): string => {
  try {
    // Ensure BASE_URL ends with a slash and endpoint doesn't start with one
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const url = new URL(`${base}${path}`);
    
    // Always include the API key
    url.searchParams.append('api_key', API_KEY);
    
    // Include language parameter if not already specified
    if (!params.language && currentApiLanguage) {
      url.searchParams.append('language', currentApiLanguage);
    }
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });
    
    return url.toString();
  } catch (error) {
    console.error('Error building URL:', { endpoint, params, error });
    throw new Error(`Failed to build URL for endpoint: ${endpoint}`);
  }
};

// Utility function to build image URLs
export const getImageUrl = (path: string | null, type: 'poster' | 'backdrop' | 'profile', size: string = 'medium'): string => {
  if (!path) return '/placeholder-image.jpg';
  
  const sizeConfig = IMAGE_SIZES[type];
  const imageSize = sizeConfig[size as keyof typeof sizeConfig] || sizeConfig.medium;
  
  return `${IMAGE_BASE_URL}/${imageSize}${path}`;
};

// API functions
export const tmdbApi = {
  // Get popular people
  getPopularPeople: async (page: number = 1): Promise<ApiResponse<Person>> => {
    const response = await fetch(buildUrl(`/person/popular?page=${page}`));
    return response.json();
  },

  // Movies
  getPopularMovies: async (page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetchWithRetry(buildUrl('/movie/popular', { page }));
    return response.json();
  },

  getTopRatedMovies: async (page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetch(buildUrl('/movie/top_rated', { page, language: currentApiLanguage }));
    return response.json();
  },

  getNowPlayingMovies: async (page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetch(buildUrl('/movie/now_playing', { page, language: currentApiLanguage }));
    return response.json();
  },

  // Get movie genres
  getMovieGenres: async (): Promise<{ genres: Genre[] }> => {
    try {
      const response = await fetchWithRetry(buildUrl('/genre/movie/list', {
        language: currentApiLanguage
      }));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movie genres: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getMovieGenres:', error);
      throw error;
    }
  },

  getUpcomingMovies: async (page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetch(buildUrl('/movie/upcoming', { page, language: currentApiLanguage }));
    return response.json();
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const response = await fetch(buildUrl(`/movie/${id}`, { language: currentApiLanguage }));
    return response.json();
  },


  getMovieCredits: async (id: number): Promise<{ cast: Cast[]; crew: Crew[] }> => {
    const response = await fetch(buildUrl(`/movie/${id}/credits`, { language: currentApiLanguage }));
    return response.json();
  },

  getSimilarMovies: async (id: number, page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetch(buildUrl(`/movie/${id}/similar`, { page, language: currentApiLanguage }));
    return response.json();
  },

  // TV Shows
  getPopularTVShows: async (page: number = 1): Promise<ApiResponse<TVShow>> => {
    const response = await fetchWithRetry(buildUrl('/tv/popular', { page }));
    return response.json();
  },

  getTopRatedTVShows: async (page: number = 1): Promise<ApiResponse<TVShow>> => {
    const response = await fetch(buildUrl('/tv/top_rated', { page, language: currentApiLanguage }));
    return response.json();
  },

  getOnTheAirTVShows: async (page: number = 1): Promise<ApiResponse<TVShow>> => {
    const response = await fetch(buildUrl('/tv/on_the_air', { page, language: currentApiLanguage }));
    return response.json();
  },

  // Get TV show genres
  getTVGenres: async (): Promise<{ genres: Genre[] }> => {
    try {
      const response = await fetchWithRetry(buildUrl('/genre/tv/list', {
        language: currentApiLanguage
      }));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch TV show genres: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getTVGenres:', error);
      throw error;
    }
  },


  // Trending
  getTrending: async (timeWindow: 'day' | 'week' = 'week', mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all'): Promise<ApiResponse<Movie | TVShow | Person>> => {
    const response = await fetchWithRetry(buildUrl(`/trending/${mediaType}/${timeWindow}`));
    return response.json();
  },

  getTrendingTVShows: async (timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<TVShow>> => {
    const response = await fetchWithRetry(buildUrl(`/trending/tv/${timeWindow}`, { language: currentApiLanguage }));
    return response.json();
  },

  getTrendingAll: async (timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<Movie | TVShow>> => {
    const response = await fetchWithRetry(buildUrl(`/trending/all/${timeWindow}`, { language: currentApiLanguage }));
    return response.json();
  },

  // Search
  searchMulti: async (query: string, page: number = 1): Promise<ApiResponse<Movie | TVShow | Person>> => {
    const response = await fetchWithRetry(buildUrl('/search/multi', { query, page }));
    return response.json();
  },

  searchMovies: async (query: string, page: number = 1): Promise<ApiResponse<Movie>> => {
    const response = await fetchWithRetry(buildUrl('/search/movie', { query, page }));
    return response.json();
  },

  searchTVShows: async (query: string, page: number = 1): Promise<ApiResponse<TVShow>> => {
    const response = await fetchWithRetry(buildUrl('/search/tv', { query, page }));
    return response.json();
  },

  searchPeople: async (query: string, page: number = 1): Promise<ApiResponse<Person>> => {
    const response = await fetchWithRetry(buildUrl('/search/person', { query, page }));
    return response.json();
  },


  // Discover
  discoverMovies: async (params: {
    page?: number;
    genre?: number;
    year?: number;
    sort_by?: string;
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_runtime_gte?: number;
    with_runtime_lte?: number;
    with_original_language?: string;
  } = {}): Promise<ApiResponse<Movie>> => {
    const response = await fetchWithRetry(buildUrl('/discover/movie', params));
    return response.json();
  },

  discoverTVShows: async (params: {
    page?: number;
    genre?: number;
    first_air_date_year?: number;
    sort_by?: string;
    vote_average_gte?: number;
    vote_average_lte?: number;
    with_original_language?: string;
  } = {}): Promise<ApiResponse<TVShow>> => {
    const response = await fetchWithRetry(buildUrl('/discover/tv', params));
    return response.json();
  },

  // Person details
  getPersonDetails: async (id: number): Promise<Person> => {
    try {
      const response = await fetchWithRetry(buildUrl(`/person/${id}`, { 
        append_to_response: 'images,combined_credits' 
      }));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch person details: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in getPersonDetails:', error);
      throw error;
    }
  },

  getPersonMovieCredits: async (id: number): Promise<{ cast: Movie[]; crew: Movie[] }> => {
    try {
      const response = await fetchWithRetry(buildUrl(`/person/${id}/movie_credits`));
      if (!response.ok) {
        throw new Error(`Failed to fetch person movie credits: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error in getPersonMovieCredits:', error);
      throw error;
    }
  },

  getPersonTVCredits: async (id: number): Promise<{ cast: TVShow[]; crew: TVShow[] }> => {
    try {
      const response = await fetchWithRetry(buildUrl(`/person/${id}/tv_credits`));
      if (!response.ok) {
        throw new Error(`Failed to fetch person TV credits: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error in getPersonTVCredits:', error);
      throw error;
    }
  },

  // Get movie videos (trailers) with language preference and fallback to English
  async getMovieVideos(movieId: number): Promise<VideosResponse> {
    // First try with the current language
    const currentLang = currentApiLanguage;
    const enUrl = buildUrl(`/movie/${movieId}/videos`, {
      language: 'en-US',
    });

    try {
      // Try with current language first
      const url = buildUrl(`/movie/${movieId}/videos`, {
        language: currentLang,
      });
      
      const response = await fetchWithRetry(url);
      const data: VideosResponse = await response.json();
      
      // Filter for official trailers in the current language
      const officialTrailers = data.results.filter(
        (video) => video.type === 'Trailer' && video.official
      );
      
      // If we found trailers in the current language, return them
      if (officialTrailers.length > 0) {
        return { ...data, results: officialTrailers };
      }
      
      // If no trailers in current language, try English
      if (currentLang !== 'en-US') {
        const enResponse = await fetchWithRetry(enUrl);
        const enData: VideosResponse = await enResponse.json();
        const enOfficialTrailers = enData.results.filter(
          (video) => video.type === 'Trailer' && video.official
        );
        
        // Return English trailers if found, otherwise return empty array
        return enOfficialTrailers.length > 0 
          ? { ...enData, results: enOfficialTrailers }
          : { ...data, results: officialTrailers }; // return empty array if no trailers found at all
      }
      
      return { ...data, results: officialTrailers };
    } catch (error) {
      console.error('Error fetching movie videos:', error);
      return { id: movieId, results: [] };
    }
  },

  // Get TV show videos (trailers) with language preference and fallback to English
  async getTVVideos(tvId: number): Promise<VideosResponse> {
    // First try with the current language
    const currentLang = currentApiLanguage;
    const enUrl = buildUrl(`/tv/${tvId}/videos`, {
      language: 'en-US',
    });

    try {
      // Try with current language first
      const url = buildUrl(`/tv/${tvId}/videos`, {
        language: currentLang,
      });
      
      const response = await fetchWithRetry(url);
      const data: VideosResponse = await response.json();
      
      // Filter for official trailers in the current language
      const officialTrailers = data.results.filter(
        (video) => video.type === 'Trailer' && video.official
      );
      
      // If we found trailers in the current language, return them
      if (officialTrailers.length > 0) {
        return { ...data, results: officialTrailers };
      }
      
      // If no trailers in current language, try English
      if (currentLang !== 'en-US') {
        const enResponse = await fetchWithRetry(enUrl);
        const enData: VideosResponse = await enResponse.json();
        const enOfficialTrailers = enData.results.filter(
          (video) => video.type === 'Trailer' && video.official
        );
        
        // Return English trailers if found, otherwise return empty array
        return enOfficialTrailers.length > 0 
          ? { ...enData, results: enOfficialTrailers }
          : { ...data, results: officialTrailers }; // return empty array if no trailers found at all
      }
      
      return { ...data, results: officialTrailers };
    } catch (error) {
      console.error('Error fetching TV show videos:', error);
      return { id: tvId, results: [] };
    }
  },

  // TV Show Details
  getTVShowDetails: async (id: number): Promise<TVShowDetails> => {
    const response = await fetch(buildUrl(`/tv/${id}`, { language: currentApiLanguage }));
    return response.json();
  },

  getTVShowCredits: async (id: number): Promise<{ cast: Cast[]; crew: Crew[] }> => {
    const response = await fetch(buildUrl(`/tv/${id}/credits`, { language: currentApiLanguage }));
    return response.json();
  },

  getSimilarTVShows: async (id: number, page: number = 1): Promise<ApiResponse<TVShow>> => {
    const response = await fetch(buildUrl(`/tv/${id}/similar`, { page, language: currentApiLanguage }));
    return response.json();
  },

  // Season Details
  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<{ episodes: Episode[] }> => {
    const response = await fetch(buildUrl(`/tv/${tvId}/season/${seasonNumber}`, { language: currentApiLanguage }));
    return response.json();
  }
};