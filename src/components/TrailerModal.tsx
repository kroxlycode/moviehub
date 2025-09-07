import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Volume2, AlertCircle } from 'lucide-react';
import { Video } from '../services/tmdbApi';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string | null;
  title: string;
  language?: string;
  videos?: Video[];
}

const TrailerModal: React.FC<TrailerModalProps> = ({ 
  isOpen, 
  onClose, 
  videoKey, 
  title,
  language = 'tr-TR',
  videos = []
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const findBestTrailer = () => {
    if (!videos || videos.length === 0) return null;
    
    const preferredLangs = ['tr', 'en', ''];
    
    for (const lang of preferredLangs) {
      const officialInLang = videos.find(
        video => 
          video.type === 'Trailer' && 
          video.official && 
          (lang === '' ? true : video.iso_639_1 === lang)
      );
      
      if (officialInLang) return officialInLang;
    }
    
    return videos.find(video => video.type === 'Trailer') || videos[0] || null;
  };

  const selectedTrailer = videoKey 
    ? { key: videoKey } 
    : findBestTrailer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTrailer?.key) {
      setIsLoading(true);
      setError(null);
      if (iframeRef.current) {
        const baseUrl = `https://www.youtube.com/embed/${selectedTrailer.key}`;
        iframeRef.current.src = `${baseUrl}?autoplay=1&modestbranding=1&rel=0`;
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      
      if (!selectedTrailer) {
        setError('Bu içerik için fragman bulunamadı.');
        setIsLoading(false);
      }
    }
  }, [isOpen, selectedTrailer]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const src = iframe.src;
      if (src.includes('youtube.com/embed/') && !src.includes('autoplay=1')) {
        iframe.src = `${src}${src.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`;
      }
    }
  };

  const handleIframeError = () => {
    setError('Fragman yüklenirken bir hata oluştu.');
    setIsLoading(false);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Play className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-300">
                {selectedTrailer ? 'Fragman' : 'Fragman Bulunamadı'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            aria-label="Kapat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Hata</h4>
              <p className="text-gray-300">{error}</p>
            </div>
          ) : selectedTrailer ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                </div>
              )}
              <iframe
                ref={iframeRef}
                className={`w-full h-full ${isLoading ? 'invisible' : 'visible'}`}
                src={selectedTrailer?.key 
                  ? `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&modestbranding=1&rel=0` 
                  : ''}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={() => {
                  setError('Failed to load trailer');
                  setIsLoading(false);
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center p-6">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Fragman Bulunamadı</h4>
                <p className="text-gray-400">Bu içerik için fragman mevcut değil.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
