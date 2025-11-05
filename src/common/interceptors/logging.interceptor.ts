import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerUtil } from '../utils/logger.util';

/**
 * Interceptor to log all incoming requests and their processing time
 * Useful for monitoring and debugging API performance
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new LoggerUtil('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`, {
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          this.logger.log(
            `Request Completed: ${method} ${url} - ${responseTime}ms`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `Request Failed: ${method} ${url} - ${responseTime}ms`,
            error.stack,
            { error: error.message },
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive data from request body logs
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'apiKey'];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}