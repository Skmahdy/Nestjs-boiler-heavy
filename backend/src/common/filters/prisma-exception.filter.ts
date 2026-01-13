import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';


@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const errorMap: Record<string, { status: HttpStatus; message: string }> = {
            P2000: {
                status: HttpStatus.BAD_REQUEST,
                message: 'The provided value for the column is too long',
            },
            P2001: {
                status: HttpStatus.NOT_FOUND,
                message: 'Record searched for in the where condition does not exist',
            },
            P2002: {
                status: HttpStatus.CONFLICT,
                message: 'Unique constraint violation',
            },
            P2003: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Foreign key constraint failed',
            },
            P2004: {
                status: HttpStatus.BAD_REQUEST,
                message: 'A constraint failed on the database',
            },
            P2005: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Invalid value stored in the database',
            },
            P2006: {
                status: HttpStatus.BAD_REQUEST,
                message: 'The provided value is not valid',
            },
            P2007: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Data validation error',
            },
            P2008: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to parse the query',
            },
            P2009: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to validate the query',
            },
            P2010: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Raw query failed',
            },
            P2011: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Null constraint violation',
            },
            P2012: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Missing a required value',
            },
            P2013: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Missing the required argument',
            },
            P2014: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Relation violation',
            },
            P2015: {
                status: HttpStatus.NOT_FOUND,
                message: 'Related record not found',
            },
            P2016: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Query interpretation error',
            },
            P2017: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Records for relation are not connected',
            },
            P2018: {
                status: HttpStatus.NOT_FOUND,
                message: 'Required connected records not found',
            },
            P2019: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Input error',
            },
            P2020: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Value out of range for the type',
            },
            P2021: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Table does not exist in the database',
            },
            P2022: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Column does not exist in the database',
            },
            P2023: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Inconsistent column data',
            },
            P2024: {
                status: HttpStatus.REQUEST_TIMEOUT,
                message: 'Timed out fetching a new connection from the pool',
            },
            P2025: {
                status: HttpStatus.NOT_FOUND,
                message: 'Record not found',
            },
            P2026: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Unsupported database feature',
            },
            P2027: {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Multiple errors occurred during query execution',
            },
        };

        const error = errorMap[exception.code];

        if (error) {
            response.status(error.status).json({
                statusCode: error.status,
                message: error.message,
                error: HttpStatus[error.status],
                code: exception.code,
            });
        } else {
            // Fallback to base exception filter for unknown codes
            super.catch(exception, host);
        }
    }
}
