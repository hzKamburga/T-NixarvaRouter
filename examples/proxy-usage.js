import TNixarvaRouter from '../src/index.js';
import { ProxyModule } from '../src/modules/proxy.js';
import { LoggerModule } from '../src/modules/logger.js';

const router = new TNixarvaRouter();
const logger = LoggerModule.create({ level: 'info' });
const proxy = ProxyModule.create({
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  transformResponse: (data) => {
    return { success: true, data };
  }
});

router.use(logger.middleware());
router.addRoute('/api/*', async (context) => {
  context.request.proxy = {
    targetURL: 'https://jsonplaceholder.typicode.com/posts/1',
    options: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  };
  return context;
});

const request = {
  method: 'GET',
  path: '/api/posts',
  headers: {}
};

const response = await router.handle(request);
console.log('Proxy Response:', JSON.stringify(response, null, 2));