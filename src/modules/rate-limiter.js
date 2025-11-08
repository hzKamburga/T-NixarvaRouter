export class RateLimiterModule {
  constructor(config = {}) {
    this.config = {
      windowMs: config.windowMs || 60000,
      maxRequests: config.maxRequests || 100,
      keyGenerator: config.keyGenerator || ((ctx) => ctx.request.ip || 'default'),
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      ...config
    };
    
    this.store = new Map();
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  getRateLimitInfo(key) {
    this.cleanupExpired();
    
    const now = Date.now();
    let record = this.store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
      this.store.set(key, record);
    }

    return record;
  }

  increment(key) {
    const record = this.getRateLimitInfo(key);
    record.count++;
    return record;
  }

  middleware() {
    return async (context) => {
      const key = this.config.keyGenerator(context);
      const record = this.getRateLimitInfo(key);
      const remaining = Math.max(0, this.config.maxRequests - record.count);
      const isLimited = record.count >= this.config.maxRequests;

      context.state.rateLimit = {
        limit: this.config.maxRequests,
        remaining,
        resetTime: record.resetTime,
        resetIn: record.resetTime - Date.now()
      };

      if (isLimited) {
        context.response = {
          status: 429,
          headers: {
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - Date.now()) / 1000).toString()
          },
          body: {
            error: 'Too many requests',
            retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
          }
        };
        return context;
      }

      this.increment(key);

      if (!context.response) {
        context.state.addRateLimitHeaders = () => ({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': (remaining - 1).toString(),
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
        });
      }

      return context;
    };
  }

  reset(key) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  static create(config) {
    return new RateLimiterModule(config);
  }
}

export default RateLimiterModule;