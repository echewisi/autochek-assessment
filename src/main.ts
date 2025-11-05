// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config values
  const port = process.env.PORT || 3000;
  const apiPrefix = 'api/v1';

  // Set global prefix
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Autochek API')
    .setDescription(
      'Vehicle Valuation and Financing API for Autochek platform',
    )
    .setVersion('1.0')
    .addTag('Vehicles', 'Vehicle management endpoints')
    .addTag('Valuations', 'Vehicle valuation endpoints')
    .addTag('Loans', 'Loan application endpoints')
    .addTag('Offers', 'Financing offer endpoints')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
      },
      'X-API-Key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  console.log(`

   Server URL: http://localhost:${port}/${apiPrefix}                  
   Swagger:    http://localhost:${port}/api/docs         
 Environment: ${process.env.NODE_ENV || 'development'}                        
  `);
}
bootstrap();