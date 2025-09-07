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
    
    this.cleanup();
    
    const record = this.requests.get(key);
    
    if (!record) {
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
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0
      };
    }
    
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

export const tmdbRateLimiter = new RateLimiter({
  maxRequests: 40, 
  windowMs: 10000, 
  keyGenerator: (endpoint: string) => `tmdb:${endpoint}`
});

export const generalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, 
  keyGenerator: (endpoint: string) => `general:${endpoint}`
});

export const addDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

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
    
    await addDelay(100);
    
    return response;
  } catch (error) {
    console.error('Rate limited fetch error:', error);
    throw error;
  }
};

export const useRateLimit = (endpoint: string, rateLimiter: RateLimiter = generalRateLimiter) => {
  const getStatus = () => rateLimiter.getStatus(endpoint);
  const reset = () => rateLimiter.reset(endpoint);
  
  return { getStatus, reset };
};

export default RateLimiter;
