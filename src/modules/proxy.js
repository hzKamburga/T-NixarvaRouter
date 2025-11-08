export class ProxyModule {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      transformRequest: config.transformRequest || null,
      transformResponse: config.transformResponse || null,
      ...config
    };
  }

  middleware() {
    return async (context) => {
      if (!context.request.proxy) return context;

      const { targetURL, options = {} } = context.request.proxy;
      const mergedOptions = { ...this.config, ...options };

      let attempt = 0;
      let lastError;

      while (attempt < mergedOptions.retries) {
        try {
          let requestData = {
            method: context.request.method || 'GET',
            headers: { ...context.request.headers, ...mergedOptions.headers }
          };

          if (context.request.body) {
            requestData.body = mergedOptions.transformRequest
              ? mergedOptions.transformRequest(context.request.body)
              : JSON.stringify(context.request.body);
          }

          const response = await fetch(targetURL, {
            ...requestData,
            signal: AbortSignal.timeout(mergedOptions.timeout)
          });

          let data = await response.text();
          try {
            data = JSON.parse(data);
          } catch {}

          if (mergedOptions.transformResponse) {
            data = mergedOptions.transformResponse(data);
          }

          context.response = {
            status: response.status,
            headers: Object.fromEntries(response.headers),
            body: data
          };

          return context;
        } catch (error) {
          lastError = error;
          attempt++;
          if (attempt < mergedOptions.retries) {
            await new Promise(resolve => setTimeout(resolve, mergedOptions.retryDelay));
          }
        }
      }

      context.response = {
        status: 500,
        body: { error: 'Proxy request failed', message: lastError.message }
      };

      return context;
    };
  }

  static create(config) {
    return new ProxyModule(config);
  }
}

export default ProxyModule;