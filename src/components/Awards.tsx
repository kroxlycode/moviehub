import React, { useState, useEffect } from 'react';
import { Award, Star, Trophy, Medal } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from './AnimatedComponents';

interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  won: boolean;
  organization: string;
  type: 'oscar' | 'golden_globe' | 'bafta' | 'emmy' | 'other';
}

interface AwardsProps {
  movieId?: number;
  tvId?: number;
  mediaType: 'movie' | 'tv';
}

const Awards: React.FC<AwardsProps> = ({ movieId, tvId, mediaType }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TMDB API doesn't provide awards data directly
    // This is a mock implementation showing how awards would be displayed
    // In a real implementation, you'd integrate with external APIs or databases
    
    const fetchAwards = async () => {
      setLoading(true);
      try {
        // Mock awards data - in real implementation, fetch from awards API
        const mockAwards: Award[] = [
          {
            id: '1',
            name: 'Academy Awards',
            category: 'En İyi Film',
            year: 2023,
            won: true,
            organization: 'Academy of Motion Picture Arts and Sciences',
            type: 'oscar'
          },
          {
            id: '2',
            name: 'Golden Globe Awards',
            category: 'En İyi Drama Filmi',
            year: 2023,
            won: false,
            organization: 'Hollywood Foreign Press Association',
            type: 'golden_globe'
          },
          {
            id: '3',
            name: 'BAFTA Awards',
            category: 'En İyi Yönetmen',
            year: 2023,
            won: true,
            organization: 'British Academy of Film and Television Arts',
            type: 'bafta'
          }
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAwards(mockAwards);
      } catch (error) {
        console.error('Ödül bilgileri alınırken hata:', error);
        setAwards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [movieId, tvId, mediaType]);

  const getAwardIcon = (type: Award['type'], won: boolean) => {
    const iconProps = {
      size: 20,
      className: won ? 'text-yellow-400' : 'text-gray-400'
    };

    switch (type) {
      case 'oscar':
        return <Trophy {...iconProps} />;
      case 'golden_globe':
        return <Award {...iconProps} />;
      case 'bafta':
        return <Medal {...iconProps} />;
      case 'emmy':
        return <Star {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const getAwardColor = (type: Award['type']) => {
    switch (type) {
      case 'oscar':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'golden_globe':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'bafta':
        return 'border-orange-500/30 bg-orange-500/10';
      case 'emmy':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ödüller ve Nominasyonlar</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (awards.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ödüller ve Nominasyonlar</h3>
        <div className="text-center py-8 text-gray-400">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p>Bu içerik için ödül bilgisi bulunamadı.</p>
          <p className="text-sm mt-2">
            Ödül verileri harici kaynaklardan sağlanmaktadır.
          </p>
        </div>
      </div>
    );
  }

  const wonAwards = awards.filter(award => award.won);
  const nominations = awards.filter(award => !award.won);

  return (
    <FadeIn>
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Ödüller ve Nominasyonlar</h3>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{wonAwards.length}</div>
            <div className="text-sm text-gray-400">Kazanılan Ödül</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{nominations.length}</div>
            <div className="text-sm text-gray-400">Nominasyon</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{awards.length}</div>
            <div className="text-sm text-gray-400">Toplam</div>
          </div>
          <div className="text-center p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">
              {awards.length > 0 ? Math.round((wonAwards.length / awards.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-400">Başarı Oranı</div>
          </div>
        </div>

        {/* Won Awards */}
        {wonAwards.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400" size={20} />
              Kazanılan Ödüller
            </h4>
            <StaggerContainer className="space-y-3">
              {wonAwards.map((award) => (
                <StaggerItem key={award.id}>
                  <div className={`flex items-center gap-4 p-4 rounded-lg border ${getAwardColor(award.type)}`}>
                    <div className="flex-shrink-0">
                      {getAwardIcon(award.type, true)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-white">{award.name}</h5>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          KAZANDI
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{award.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{award.year}</span>
                        <span>{award.organization}</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Nominations */}
        {nominations.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="text-blue-400" size={20} />
              Nominasyonlar
            </h4>
            <StaggerContainer className="space-y-3">
              {nominations.map((award) => (
                <StaggerItem key={award.id}>
                  <div className={`flex items-center gap-4 p-4 rounded-lg border ${getAwardColor(award.type)}`}>
                    <div className="flex-shrink-0">
                      {getAwardIcon(award.type, false)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-white">{award.name}</h5>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          NOMİNE
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{award.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{award.year}</span>
                        <span>{award.organization}</span>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            * Ödül bilgileri harici kaynaklardan alınmaktadır ve güncel olmayabilir.
          </p>
        </div>
      </div>
    </FadeIn>
  );
};

export default Awards;
