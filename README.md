# T-NixarvaRouter

AI proxy and API developer kit with modular routing system.

## Features

- 🚀 ES Module support (Node.js 18+)
- 🔌 Modular middleware architecture
- 🔄 Built-in proxy module with retry logic
- ✅ Request validation
- 📊 Structured logging
- ⚡ Rate limiting
- 🎯 Simple routing system

## Installation

```bash
npm install t-nixarva-router
```

## Quick Start

```javascript
import TNixarvaRouter from 't-nixarva-router';

const router = new TNixarvaRouter();

router.addRoute('/hello', async (context) => {
  return {
    status: 200,
    body: { message: 'Hello World!' }
  };
});

const response = await router.handle({
  method: 'GET',
  path: '/hello',
  headers: {}
});
```

## Modules

### Logger Module

```javascript
import { LoggerModule } from 't-nixarva-router/logger';

const logger = LoggerModule.create({
  level: 'info',
  format: 'json',
  colorize: true
});

router.use(logger.middleware());
```

### Rate Limiter Module

```javascript
import { RateLimiterModule } from 't-nixarva-router/rate-limiter';

const limiter = RateLimiterModule.create({
  maxRequests: 100,
  windowMs: 60000
});

router.use(limiter.middleware());
```

### Validator Module

```javascript
import { ValidatorModule } from 't-nixarva-router/validator';

const validator = ValidatorModule.create({
  userSchema: {
    email: { required: true, type: 'string', pattern: /^.+@.+\..+$/ },
    age: { type: 'number', min: 0, max: 150 }
  }
});

router.use(validator.middleware('userSchema'));
```

### Proxy Module

```javascript
import { ProxyModule } from 't-nixarva-router/proxy';

const proxy = ProxyModule.create({
  timeout: 10000,
  retries: 3,
  transformResponse: (data) => ({ success: true, data })
});

router.use(proxy.middleware());

router.addRoute('/api/*', async (context) => {
  context.request.proxy = {
    targetURL: 'https://api.example.com',
    options: { headers: { 'Authorization': 'Bearer token' } }
  };
  return context;
});
```

## Examples

See the `examples/` directory:

- `basic-usage.js` - Basic routing and middleware
- `proxy-usage.js` - Proxy configuration

Run examples:

```bash
npm run example
```

## API Reference

### TNixarvaRouter

#### Constructor

```javascript
new TNixarvaRouter(config)
```

**Config options:**
- `baseURL` - Base URL for the router
- `timeout` - Default timeout in milliseconds

#### Methods

- `use(middleware)` - Add middleware
- `addRoute(path, handler)` - Register route handler
- `handle(request)` - Process request

### Context Object

```javascript
{
  request: {
    method: 'GET',
    path: '/path',
    headers: {},
    body: {},
    query: {},
    params: {}
  },
  response: null,
  config: {},
  state: {}
}
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run examples
npm run example
```

## License

MIT