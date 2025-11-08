export class TNixarvaRouter {
  constructor(config = {}) {
    this.routes = new Map();
    this.middlewares = [];
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 30000,
      ...config
    };
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  addRoute(path, handler) {
    this.routes.set(path, handler);
    return this;
  }

  async handle(request) {
    let context = {
      request,
      response: null,
      config: this.config,
      params: {},
      state: {}
    };

    for (const middleware of this.middlewares) {
      context = await middleware(context);
      if (context.response) return context.response;
    }

    const handler = this.routes.get(request.path) || this.routes.get('*');
    
    if (handler) {
      context.response = await handler(context);
      return context.response;
    }

    return {
      status: 404,
      body: { error: 'Route not found' }
    };
  }

  async proxy(targetURL, options = {}) {
    return async (context) => {
      const url = new URL(targetURL);
      const headers = { ...context.request.headers, ...options.headers };
      
      try {
        const response = await fetch(url.toString(), {
          method: context.request.method || 'GET',
          headers,
          body: context.request.body,
          signal: AbortSignal.timeout(this.config.timeout)
        });

        const data = await response.json().catch(() => response.text());
        
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: data
        };
      } catch (error) {
        return {
          status: 500,
          body: { error: error.message }
        };
      }
    };
  }
}

export default TNixarvaRouter;