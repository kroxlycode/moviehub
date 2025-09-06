interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (endpoint: string) => string;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RequestRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (endpoint: string) => endpoint,
      ...config
    };
  }

  async checkLimit(endpoint: string): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const key = this.config.keyGenerator!(endpoint);
    const now = Date.now();
    
    // Clean up expired records
    this.cleanup();
    
    const record = this.requests.get(key);
    
    if (!record) {
      // First request for this key
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    if (now >= record.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    if (record.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0
      };
    }
    
    // Increment count
    record.count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }
  
  private cleanup(): void {
    const now = Date.now();
    
    Array.from(this.requests.entries()).forEach(([key, record]) => {
      if (now >= record.resetTime) {
        this.requests.delete(key);
      }
    });
  }
  
  reset(endpoint?: string): void {
    if (endpoint) {
      const key = this.config.keyGenerator!(endpoint);
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
  
  getStatus(endpoint: string): { count: number; resetTime: number; remaining: number } | null {
    const key = this.config.keyGenerator!(endpoint);
    const record = this.requests.get(key);
    
    if (!record) {
      return null;
    }
    
    return {
      count: record.count,
      resetTime: record.resetTime,
      remaining: Math.max(0, this.config.maxRequests - record.count)
    };
  }
}

// Create rate limiter instances for different API endpoints
export const tmdbRateLimiter = new RateLimiter({
  maxRequests: 40, // TMDB allows 40 requests per 10 seconds
  windowMs: 10000, // 10 seconds
  keyGenerator: (endpoint: string) => `tmdb:${endpoint}`
});

export const generalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  keyGenerator: (endpoint: string) => `general:${endpoint}`
});

// Utility function to add delay between requests
export const addDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Rate limited fetch wrapper
export const rateLimitedFetch = async (
  url: string, 
  options?: RequestInit,
  rateLimiter: RateLimiter = generalRateLimiter
): Promise<Response> => {
  const endpoint = new URL(url).pathname;
  
  const limitCheck = await rateLimiter.checkLimit(endpoint);
  
  if (!limitCheck.allowed) {
    const waitTime = limitCheck.resetTime! - Date.now();
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
  }
  
  try {
    const response = await fetch(url, options);
    
    // Add small delay to prevent overwhelming the API
    await addDelay(100);
    
    return response;
  } catch (error) {
    console.error('Rate limited fetch error:', error);
    throw error;
  }
};

// Hook for React components to check rate limit status
export const useRateLimit = (endpoint: string, rateLimiter: RateLimiter = generalRateLimiter) => {
  const getStatus = () => rateLimiter.getStatus(endpoint);
  const reset = () => rateLimiter.reset(endpoint);
  
  return { getStatus, reset };
};

export default RateLimiter;
