export class LoggerModule {
  constructor(config = {}) {
    this.config = {
      level: config.level || 'info',
      timestamp: config.timestamp !== false,
      colorize: config.colorize !== false,
      format: config.format || 'text',
      ...config
    };
    
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[90m',
      reset: '\x1b[0m'
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.config.level];
  }

  format(level, message, meta = {}) {
    const timestamp = this.config.timestamp ? new Date().toISOString() : '';
    const color = this.config.colorize ? this.colors[level] : '';
    const reset = this.config.colorize ? this.colors.reset : '';

    if (this.config.format === 'json') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    }

    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${reset}`;
  }

  log(level, message, meta) {
    if (!this.shouldLog(level)) return;

    const formatted = this.format(level, message, meta);
    const output = level === 'error' ? console.error : console.log;
    output(formatted);
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  debug(message, meta) {
    this.log('debug', message, meta);
  }

  middleware() {
    return async (context) => {
      const startTime = Date.now();
      
      this.info('Request started', {
        method: context.request.method,
        path: context.request.path,
        headers: context.request.headers
      });

      const originalResponse = context.response;
      
      if (!originalResponse) {
        context.state.logger = this;
        return context;
      }

      const duration = Date.now() - startTime;
      
      this.info('Request completed', {
        method: context.request.method,
        path: context.request.path,
        status: originalResponse.status,
        duration: `${duration}ms`
      });

      return context;
    };
  }

  static create(config) {
    return new LoggerModule(config);
  }
}

export default LoggerModule;