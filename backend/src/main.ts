import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Get Winston logger
    const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(logger);

    // Enable global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,           // Strip non-whitelisted properties
            forbidNonWhitelisted: true, // Throw error on non-whitelisted properties
            transform: true,            // Auto-transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Enable global exception filter for Prisma errors
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    // Enable global response transformation
    app.useGlobalInterceptors(new TransformInterceptor());

    // Configure CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });

    // Setup Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('Backend API')
        .setDescription('NestJS + Prisma Backend API with JWT Authentication')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API Documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
