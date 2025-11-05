import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerUtil } from '../utils/logger.util';

/**
 * Global exception filter to handle and format all HTTP exceptions
 * Provides consistent error responses across the application
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerUtil('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // Handle HttpException (including validation errors)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      // Handle standard errors
      message = exception.message;
      this.logger.error('Unhandled exception', exception.stack, {
        path: request.url,
        method: request.method,
      });
    }

    // Format error response
    const errorResponse = {
      success: false,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
    };

    // Log error for monitoring
    if (status >= 500) {
      this.logger.error(`HTTP ${status} Error`, JSON.stringify(exception), {
        path: request.url,
        method: request.method,
      });
    }

    response.status(status).json(errorResponse);
  }
}