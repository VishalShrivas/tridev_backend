import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import { ErrorResponse } from '../interfaces/error-response.interface';

/**
 * Single global filter that normalizes every thrown error (HttpException,
 * known Prisma errors, or anything unexpected) into the consistent
 * ErrorResponse shape, and prevents internal details (stack traces, SQL,
 * driver messages) from leaking to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveError(exception);

    const isServerError = statusCode >= 500;

    if (isServerError) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(body);
  }

  private resolveError(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      const statusText = STATUS_CODES[status] ?? exception.name;

      if (typeof payload === 'string') {
        return { statusCode: status, message: payload, error: statusText };
      }

      const payloadObj = payload as Record<string, unknown>;
      return {
        statusCode: status,
        message: (payloadObj.message as string | string[]) ?? exception.message,
        error: (payloadObj.error as string) ?? statusText,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private resolvePrismaError(exception: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
    error: string;
  } {
    switch (exception.code) {
      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(
          ', ',
        );
        return {
          statusCode: HttpStatus.CONFLICT,
          message: target
            ? `A record with this ${target} already exists`
            : 'A record with these values already exists',
          error: 'Conflict',
        };
      }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          error: 'Not Found',
        };
      case 'P2003': {
        const field = exception.meta?.field_name as string | undefined;
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: field
            ? `Referenced ${field} does not exist`
            : 'Referenced resource does not exist',
          error: 'Bad Request',
        };
      }
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        };
    }
  }
}
