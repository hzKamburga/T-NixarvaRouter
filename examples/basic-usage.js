import TNixarvaRouter from '../src/index.js';
import { LoggerModule } from '../src/modules/logger.js';
import { ValidatorModule } from '../src/modules/validator.js';
import { RateLimiterModule } from '../src/modules/rate-limiter.js';

const router = new TNixarvaRouter({
  baseURL: 'http://localhost:3000',
  timeout: 5000
});

const logger = LoggerModule.create({ level: 'debug' });
const rateLimiter = RateLimiterModule.create({ 
  maxRequests: 10, 
  windowMs: 60000 
});

router.use(logger.middleware());
router.use(rateLimiter.middleware());

router.addRoute('/hello', async (context) => {
  return {
    status: 200,
    body: { message: 'Hello from T-NixarvaRouter!' }
  };
});

router.addRoute('/user/:id', async (context) => {
  const userId = context.params.id;
  return {
    status: 200,
    body: { userId, name: 'Example User' }
  };
});

const request = {
  method: 'GET',
  path: '/hello',
  headers: { 'user-agent': 'test' }
};

const response = await router.handle(request);
console.log('Response:', response);