import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Globe, Calendar } from 'lucide-react';
import { FadeIn } from './AnimatedComponents';

interface BoxOfficeData {
  budget: number;
  revenue: number;
  release_date: string;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
}

interface BoxOfficeProps {
  movieId: number;
}

const BoxOffice: React.FC<BoxOfficeProps> = ({ movieId }) => {
  const [boxOfficeData, setBoxOfficeData] = useState<BoxOfficeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoxOfficeData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=tr-TR`
        );
        const data = await response.json();
        setBoxOfficeData(data);
      } catch (error) {
        console.error('Box office verileri alınırken hata:', error);
        setBoxOfficeData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoxOfficeData();
  }, [movieId]);

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Bilinmiyor';
    
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const calculateProfit = (revenue: number, budget: number) => {
    if (revenue === 0 || budget === 0) return null;
    return revenue - budget;
  };

  const calculateROI = (revenue: number, budget: number) => {
    if (revenue === 0 || budget === 0) return null;
    return ((revenue - budget) / budget) * 100;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gişe Bilgileri</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!boxOfficeData || (boxOfficeData.budget === 0 && boxOfficeData.revenue === 0)) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Gişe Bilgileri</h3>
        <p className="text-gray-400">Bu film için gişe bilgileri mevcut değil.</p>
      </div>
    );
  }

  const profit = calculateProfit(boxOfficeData.revenue, boxOfficeData.budget);
  const roi = calculateROI(boxOfficeData.revenue, boxOfficeData.budget);

  return (
    <FadeIn>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Gişe Bilgileri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <DollarSign size={18} />
              <span className="font-medium">Bütçe</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(boxOfficeData.budget)}
            </div>
            {boxOfficeData.budget > 0 && (
              <div className="text-sm text-gray-400">
                Yapım maliyeti
              </div>
            )}
          </div>

          {/* Revenue */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp size={18} />
              <span className="font-medium">Hasılat</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(boxOfficeData.revenue)}
            </div>
            {boxOfficeData.revenue > 0 && (
              <div className="text-sm text-gray-400">
                Dünya çapında toplam
              </div>
            )}
          </div>

          {/* Profit */}
          {profit !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400">
                <TrendingUp size={18} />
                <span className="font-medium">Kar/Zarar</span>
              </div>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{formatCurrency(Math.abs(profit))}
              </div>
              <div className="text-sm text-gray-400">
                {profit >= 0 ? 'Kar' : 'Zarar'}
              </div>
            </div>
          )}

          {/* ROI */}
          {roi !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-400">
                <TrendingUp size={18} />
                <span className="font-medium">Yatırım Getirisi</span>
              </div>
              <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">
                ROI oranı
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-400">Çıkış Tarihi:</span>
              <span className="text-white">
                {boxOfficeData.release_date 
                  ? new Date(boxOfficeData.release_date).toLocaleDateString('tr-TR')
                  : 'Bilinmiyor'
                }
              </span>
            </div>
            
            {boxOfficeData.production_countries && boxOfficeData.production_countries.length > 0 && (
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                <span className="text-gray-400">Yapım Ülkesi:</span>
                <span className="text-white">
                  {boxOfficeData.production_countries[0].name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Indicator */}
        {boxOfficeData.budget > 0 && boxOfficeData.revenue > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Performans</span>
              <span className="text-white">
                {((boxOfficeData.revenue / boxOfficeData.budget) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  boxOfficeData.revenue >= boxOfficeData.budget * 2
                    ? 'bg-green-500'
                    : boxOfficeData.revenue >= boxOfficeData.budget
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(
                    (boxOfficeData.revenue / (boxOfficeData.budget * 3)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Bütçe</span>
              <span>2x Bütçe</span>
              <span>3x Bütçe</span>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default BoxOffice;
