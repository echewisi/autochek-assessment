import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

/**
 * Guard to protect endpoints with API key authentication
 * Validates the X-API-Key header against configured API key
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const configuredApiKey = this.configService.get<string>('API_KEY');

    // If no API key is configured, allow access (development mode)
    if (!configuredApiKey) {
      return true;
    }

    if (!apiKey || apiKey !== configuredApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}