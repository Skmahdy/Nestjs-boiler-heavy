import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'staging')
        .default('development'),
    PORT: Joi.number().default(3000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required().min(32),
    JWT_EXPIRES_IN: Joi.string().default('24h'),
    ALLOWED_ORIGINS: Joi.string().default('http://localhost:3001'),
});
