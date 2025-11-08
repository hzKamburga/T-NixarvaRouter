import TNixarvaRouter from '../src/index.js';
import { ValidatorModule } from '../src/modules/validator.js';
import { LoggerModule } from '../src/modules/logger.js';

const router = new TNixarvaRouter();
const logger = LoggerModule.create({ level: 'info' });

const validator = ValidatorModule.create({
  createUser: {
    email: { 
      required: true, 
      type: 'string', 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    username: { 
      required: true, 
      type: 'string', 
      minLength: 3, 
      maxLength: 20 
    },
    age: { 
      type: 'number', 
      min: 18, 
      max: 120 
    },
    role: {
      required: true,
      enum: ['user', 'admin', 'moderator']
    }
  }
});

router.use(logger.middleware());

router.addRoute('/user/create', async (context) => {
  const validationResult = validator.validate(context.request.body, validator.schemas.createUser);
  
  if (!validationResult.valid) {
    return {
      status: 400,
      body: { 
        error: 'Validation failed', 
        details: validationResult.errors 
      }
    };
  }

  return {
    status: 201,
    body: { 
      message: 'User created successfully', 
      user: context.request.body 
    }
  };
});

const validRequest = {
  method: 'POST',
  path: '/user/create',
  headers: {},
  body: {
    email: 'user@example.com',
    username: 'johndoe',
    age: 25,
    role: 'user'
  }
};

const invalidRequest = {
  method: 'POST',
  path: '/user/create',
  headers: {},
  body: {
    email: 'invalid-email',
    username: 'ab',
    age: 15,
    role: 'superuser'
  }
};

console.log('Valid Request:');
const validResponse = await router.handle(validRequest);
console.log(JSON.stringify(validResponse, null, 2));

console.log('\nInvalid Request:');
const invalidResponse = await router.handle(invalidRequest);
console.log(JSON.stringify(invalidResponse, null, 2));