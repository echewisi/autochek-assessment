import { SetMetadata } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import {
  ApiResponse as SwaggerApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

/**
 * Custom decorator to mark endpoints as public (bypass API key guard)
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorator to standardize Swagger API documentation
 */
export const ApiStandardResponse = (options: {
  summary: string;
  description?: string;
  type?: any;
  status?: number;
}) => {
  const decorators = [
    ApiOperation({
      summary: options.summary,
      description: options.description,
    }),
    SwaggerApiResponse({
      status: options.status || 200,
      description: 'Success',
      type: options.type,
    }),
    SwaggerApiResponse({
      status: 400,
      description: 'Bad Request',
    }),
    SwaggerApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  ];

  return applyDecorators(...decorators);
};