// Import types from tmdbApi
import type {
  Movie,
  TVShow,
  Person,
  Video,
  Cast,
  Crew,
  Genre,
  ApiResponse,
  MovieDetails,
  TVShowDetails,
  Season,
  Episode
} from '../services/tmdbApi';

export type { Movie };
export type { TVShow };
export type { Person };
export type { Video };
export type { Cast };
export type { Crew };
export type { Genre };
export type { ApiResponse };
export type { MovieDetails };
export type { TVShowDetails };
export type { Season };
export type { Episode };

// Common props for components
export interface WithBackButtonProps {
  onBack: () => void;
}

export interface WithPlayTrailerProps {
  onPlayTrailer: (item: Movie | TVShow) => Promise<void>;
}

// Page props
export interface HomePageProps extends WithPlayTrailerProps {
  onMovieClick: (movie: Movie) => void;
  onTVShowClick: (tvShow: TVShow) => void;
}

export interface MoviesPageProps extends WithPlayTrailerProps {
  onMovieClick: (movie: Movie) => void;
}

export interface TVShowsPageProps extends WithPlayTrailerProps {
  onTVShowClick: (tvShow: TVShow) => void;
}

export interface PeoplePageProps {
  onActorClick: (person: Person) => void;
}

export interface MovieDetailPageProps extends WithBackButtonProps {
  movieId: number;
  onPlayTrailer: (item: Movie) => Promise<void>;
}

export interface TVShowDetailPageProps extends WithBackButtonProps {
  tvShowId: number;
  onPlayTrailer: (item: TVShow) => Promise<void>;
}

export interface PersonDetailPageProps extends WithBackButtonProps {
  personId: number;
}

export interface SearchResultsPageProps extends WithBackButtonProps {
  query: string;
  onItemClick: (item: Movie | TVShow) => void;
  onPlayTrailer: (item: Movie | TVShow) => Promise<void>;
}
