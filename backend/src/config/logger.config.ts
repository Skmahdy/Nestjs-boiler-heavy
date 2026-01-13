import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    // Add stack trace if present
    if (stack) {
        msg += `\n${stack}`;
    }

    return msg;
});

// Create logger configuration
export const createLoggerConfig = () => {
    const transports: winston.transport[] = [
        // Console transport
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                errors({ stack: true }),
                consoleFormat
            ),
        }),
    ];

    // Add file transports in production
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        transports.push(
            // Error log file
            new winston.transports.File({
                filename: 'error.log',
                level: 'error',
                format: combine(
                    timestamp(),
                    errors({ stack: true }),
                    winston.format.json()
                ),
            }),
            // Combined log file
            new winston.transports.File({
                filename: 'combined.log',
                format: combine(
                    timestamp(),
                    winston.format.json()
                ),
            })
        );
    }

    return {
        transports,
        level: process.env.LOG_LEVEL || 'info',
        exitOnError: false,
    };
};
