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

  // Find the best matching trailer based on language preference
  const findBestTrailer = () => {
    if (!videos || videos.length === 0) return null;
    
    // Try to find an official trailer in the current language
    const officialInCurrentLang = videos.find(
      (video) => 
        video.type === 'Trailer' && 
        video.official && 
        video.iso_639_1 === language.split('-')[0]
    );
    
    if (officialInCurrentLang) return officialInCurrentLang;
    
    // If no trailer in current language, try to find any official trailer
    const anyOfficialTrailer = videos.find(
      (video) => video.type === 'Trailer' && video.official
    );
    
    // If no official trailer, try to find any trailer
    return anyOfficialTrailer || videos[0];
  };

  const selectedTrailer = videoKey 
    ? { key: videoKey } 
    : findBestTrailer();

  // Reset loading state when modal opens or video changes
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
        {/* Header */}
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

        {/* Video Container */}
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
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0&modestbranding=1&showinfo=0&cc_lang_pref=${language}&hl=${language}`}
                title={`${title} Trailer`}
                className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
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
