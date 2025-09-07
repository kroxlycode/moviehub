import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';
import { tmdbApi } from '../services/tmdbApi';

interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

interface Image {
  file_path: string;
  aspect_ratio: number;
  height: number;
  width: number;
}

interface MediaGalleryProps {
  movieId?: number;
  tvId?: number;
  mediaType: 'movie' | 'tv';
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ movieId, tvId, mediaType }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'images'>('videos');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!movieId && !tvId) return;
      
      setLoading(true);
      try {
        const id = movieId || tvId!;
        
        const videosResponse = mediaType === 'movie' 
          ? await tmdbApi.getMovieVideos(id)
          : await tmdbApi.getTVVideos(id);
        
        const filteredVideos = videosResponse.results.filter((video: Video) => 
          video.site === 'YouTube' && 
          (video.type === 'Trailer' || video.type === 'Teaser' || video.type === 'Clip')
        );
        setVideos(filteredVideos);

        const imagesResponse = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/images?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        const imagesData = await imagesResponse.json();
        
        const allImages = [
          ...(imagesData.backdrops || []),
          ...(imagesData.posters || [])
        ].slice(0, 20); 
        setImages(allImages);
      } catch (error) {
        console.error('Medya galerisi yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [movieId, tvId, mediaType]);

  const openVideo = (videoKey: string) => {
    setSelectedMedia(videoKey);
  };

  const openImageGallery = (index: number) => {
    setCurrentImageIndex(index);
    setSelectedMedia('image-gallery');
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Medya Galerisi</h3>
        <div className="animate-pulse">
          <div className="flex gap-4 mb-4">
            <div className="h-8 bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-700 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-video bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0 && images.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Medya Galerisi</h3>
        <p className="text-gray-400">Bu içerik için medya bulunamadı.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Medya Galerisi</h3>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'videos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Play size={16} />
              <span>Videolar ({videos.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'images'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon size={16} />
              <span>Görseller ({images.length})</span>
            </div>
          </button>
        </div>

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="relative group cursor-pointer"
                onClick={() => openVideo(video.key)}
              >
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                    alt={video.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-white font-medium text-sm line-clamp-2">
                    {video.name}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {video.type} • YouTube
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer"
                onClick={() => openImageGallery(index)}
              >
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                    alt={`Görsel ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMedia && selectedMedia !== 'image-gallery' && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedMedia}?autoplay=1`}
                title="Video Player"
                className="w-full h-full rounded-lg"
                allowFullScreen
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}

      {selectedMedia === 'image-gallery' && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={32} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft size={48} />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight size={48} />
          </button>

          <div className="max-w-6xl max-h-full p-4">
            <img
              src={`https://image.tmdb.org/t/p/original${images[currentImageIndex]?.file_path}`}
              alt={`Görsel ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;
