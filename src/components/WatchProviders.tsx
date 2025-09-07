import React, { useState, useEffect } from 'react';
import { ExternalLink, Play, ShoppingCart } from 'lucide-react';
import { tmdbApi } from '../services/tmdbApi';

interface Provider {
  logo_path: string;
  provider_name: string;
  provider_id: number;
}

interface WatchProvidersData {
  flatrate?: Provider[];
  rent?: Provider[];
  buy?: Provider[];
  link?: string;
}

interface WatchProvidersProps {
  movieId?: number;
  tvId?: number;
  mediaType: 'movie' | 'tv';
}

const WatchProviders: React.FC<WatchProvidersProps> = ({ movieId, tvId, mediaType }) => {
  const [providers, setProviders] = useState<WatchProvidersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      if (!movieId && !tvId) return;
      
      setLoading(true);
      try {
        const id = movieId || tvId!;
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=${process.env.REACT_APP_TMDB_API_KEY}`
        );
        const data = await response.json();
        
        const turkeyProviders = data.results?.TR;
        const usProviders = data.results?.US;
        
        setProviders(turkeyProviders || usProviders || null);
      } catch (error) {
        console.error('İzleme sağlayıcıları alınırken hata:', error);
        setProviders(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [movieId, tvId, mediaType]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nerede İzleyebilirsiniz</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Nerede İzleyebilirsiniz</h3>
        <p className="text-gray-400">
          Bu içerik için Türkiye'de bilinen dijital platform bulunamadı.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Alternatif arama önerileri:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Google'da "{mediaType === 'movie' ? 'film' : 'dizi'} adını" arayın</li>
            <li>JustWatch.com sitesini kontrol edin</li>
            <li>Yerel sinema/TV kanallarını takip edin</li>
          </ul>
        </div>
      </div>
    );
  }

  const ProviderSection: React.FC<{ 
    title: string; 
    providers: Provider[]; 
    icon: React.ReactNode;
    bgColor: string;
  }> = ({ title, providers, icon, bgColor }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <div
            key={provider.provider_id}
            className={`flex items-center gap-2 px-3 py-2 ${bgColor} rounded-lg transition-transform hover:scale-105`}
            title={provider.provider_name}
          >
            <img
              src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
              alt={provider.provider_name}
              className="w-6 h-6 rounded"
            />
            <span className="text-sm font-medium text-white">
              {provider.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Nerede İzleyebilirsiniz</h3>
        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            <ExternalLink size={14} />
            <span>JustWatch</span>
          </a>
        )}
      </div>

      <div className="space-y-4">
        {providers.flatrate && providers.flatrate.length > 0 && (
          <ProviderSection
            title="Abonelik ile İzle"
            providers={providers.flatrate}
            icon={<Play size={16} className="text-green-400" />}
            bgColor="bg-green-600/20 border border-green-500/30"
          />
        )}

        {providers.rent && providers.rent.length > 0 && (
          <ProviderSection
            title="Kirala"
            providers={providers.rent}
            icon={<ExternalLink size={16} className="text-yellow-400" />}
            bgColor="bg-yellow-600/20 border border-yellow-500/30"
          />
        )}

        {providers.buy && providers.buy.length > 0 && (
          <ProviderSection
            title="Satın Al"
            providers={providers.buy}
            icon={<ShoppingCart size={16} className="text-blue-400" />}
            bgColor="bg-blue-600/20 border border-blue-500/30"
          />
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          * Fiyatlar ve kullanılabilirlik değişebilir. Güncel bilgiler için platform sitelerini ziyaret edin.
        </p>
      </div>
    </div>
  );
};

export default WatchProviders;
