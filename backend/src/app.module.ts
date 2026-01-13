import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { envValidationSchema } from './config/env.validation';
import { createLoggerConfig } from './config/logger.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
        }),
        WinstonModule.forRoot(createLoggerConfig()),
        PrismaModule,
        AuthModule,
        UsersModule,
        HealthModule,
    ],
})
export class AppModule { }
