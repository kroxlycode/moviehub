declare const useSeo: (options: {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  noIndex?: boolean;
}) => void;

export default useSeo;
