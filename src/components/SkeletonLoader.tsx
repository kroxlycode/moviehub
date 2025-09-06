import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div 
      className={`skeleton rounded ${width} ${height} ${className}`}
      style={{ 
        background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%)',
        backgroundSize: '200% 100%',
        animation: 'loading 1.5s infinite'
      }}
    />
  );
};

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <Skeleton height="h-64" className="rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton height="h-5" width="w-3/4" />
        <Skeleton height="h-4" width="w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton height="h-4" width="w-16" />
          <Skeleton height="h-4" width="w-12" />
        </div>
      </div>
    </div>
  );
};

export const PersonCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <Skeleton height="h-64" className="rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton height="h-5" width="w-2/3" />
        <Skeleton height="h-4" width="w-1/3" />
      </div>
    </div>
  );
};

export const HorizontalScrollSkeleton: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height="h-6" width="w-48" />
        <Skeleton height="h-4" width="w-20" />
      </div>
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-48">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
};

export const DetailPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section Skeleton */}
      <div className="relative h-96 bg-gray-800">
        <Skeleton height="h-full" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex gap-6">
            <Skeleton height="h-64" width="w-44" className="rounded-lg" />
            <div className="flex-1 space-y-4">
              <Skeleton height="h-8" width="w-2/3" />
              <Skeleton height="h-6" width="w-1/2" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="h-8" width="w-20" className="rounded-full" />
                ))}
              </div>
              <div className="flex gap-4">
                <Skeleton height="h-12" width="w-32" className="rounded-lg" />
                <Skeleton height="h-12" width="w-32" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton height="h-6" width="w-32" />
          <div className="space-y-2">
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-3/4" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton height="h-6" width="w-24" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton height="h-32" className="rounded-lg" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-3" width="w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton height="h-8" width="w-64" />
        <Skeleton height="h-6" width="w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export const HeroBannerSkeleton: React.FC = () => {
  return (
    <div className="relative h-screen bg-gray-800 overflow-hidden">
      <Skeleton height="h-full" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute bottom-20 left-8 right-8 md:left-16 md:right-16">
        <div className="max-w-2xl space-y-6">
          <Skeleton height="h-12" width="w-3/4" />
          <div className="space-y-2">
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-2/3" />
          </div>
          <div className="flex gap-4">
            <Skeleton height="h-12" width="w-32" className="rounded-lg" />
            <Skeleton height="h-12" width="w-32" className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
