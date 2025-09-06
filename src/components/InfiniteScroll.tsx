import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem, FadeIn } from './AnimatedComponents';
import { MovieCardSkeleton } from './SkeletonLoader';

interface InfiniteScrollProps<T> {
  fetchData: (page: number) => Promise<{ results: T[]; total_pages: number }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  gridClassName?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  threshold?: number;
  initialPage?: number;
}

function InfiniteScroll<T extends { id: number }>({
  fetchData,
  renderItem,
  className = '',
  gridClassName = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6',
  loadingComponent,
  emptyComponent,
  threshold = 300,
  initialPage = 1
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Load data function
  const loadData = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchData(pageNum);
      
      if (reset) {
        setItems(response.results);
      } else {
        setItems(prev => [...prev, ...response.results]);
      }
      
      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Infinite scroll error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, loading]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      loadData(initialPage, true);
      isInitialLoad.current = false;
    }
  }, [loadData, initialPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadData(page + 1);
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, loading, page, loadData, threshold]);

  // Reset function for external use
  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    isInitialLoad.current = true;
  }, [initialPage]);

  // Reset function is available via ref if needed

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => loadData(page, items.length === 0)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className={className}>
        {emptyComponent || (
          <FadeIn>
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">İçerik Bulunamadı</h3>
              <p>Aradığınız kriterlere uygun içerik bulunamadı.</p>
            </div>
          </FadeIn>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <StaggerContainer className={gridClassName} staggerDelay={0.05}>
        {items.map((item, index) => (
          <StaggerItem key={`${item.id}-${index}`}>
            {renderItem(item, index)}
          </StaggerItem>
        ))}
      </StaggerContainer>

      {loading && (
        <div className="mt-8">
          {loadingComponent || (
            <div className={gridClassName}>
              {[...Array(10)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCardSkeleton />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {hasMore && !loading && (
        <div ref={observerRef} className="h-10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full"
          />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <FadeIn>
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🎭</div>
            <p>Tüm içerikler yüklendi</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

export default InfiniteScroll;
