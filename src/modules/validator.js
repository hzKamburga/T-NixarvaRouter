export class ValidatorModule {
  constructor(schemas = {}) {
    this.schemas = schemas;
  }

  addSchema(name, schema) {
    this.schemas[name] = schema;
    return this;
  }

  validate(data, schema) {
    if (typeof schema === 'function') {
      return schema(data);
    }

    if (typeof schema === 'object') {
      const errors = [];

      for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];

        if (rules.required && (value === undefined || value === null)) {
          errors.push(`${key} is required`);
          continue;
        }

        if (value !== undefined && value !== null) {
          if (rules.type && typeof value !== rules.type) {
            errors.push(`${key} must be of type ${rules.type}`);
          }

          if (rules.min !== undefined && value < rules.min) {
            errors.push(`${key} must be at least ${rules.min}`);
          }

          if (rules.max !== undefined && value > rules.max) {
            errors.push(`${key} must be at most ${rules.max}`);
          }

          if (rules.minLength !== undefined && value.length < rules.minLength) {
            errors.push(`${key} must have at least ${rules.minLength} characters`);
          }

          if (rules.maxLength !== undefined && value.length > rules.maxLength) {
            errors.push(`${key} must have at most ${rules.maxLength} characters`);
          }

          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${key} format is invalid`);
          }

          if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
          }

          if (rules.custom && !rules.custom(value)) {
            errors.push(`${key} failed custom validation`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    }

    return { valid: true, errors: [] };
  }

  middleware(schemaName) {
    return async (context) => {
      const schema = this.schemas[schemaName];
      
      if (!schema) {
        context.response = {
          status: 500,
          body: { error: `Schema '${schemaName}' not found` }
        };
        return context;
      }

      const data = context.request.body || context.request.query || {};
      const result = this.validate(data, schema);

      if (!result.valid) {
        context.response = {
          status: 400,
          body: { error: 'Validation failed', details: result.errors }
        };
        return context;
      }

      context.state.validated = data;
      return context;
    };
  }

  static create(schemas) {
    return new ValidatorModule(schemas);
  }
}

export default ValidatorModule;