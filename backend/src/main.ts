import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  // Add a global middleware to log all requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.log(`${req.method} ${req.url}`);
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: [
      'https://jamoveo-frontend-9zh9.onrender.com',
      'http://localhost:5173',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization,Accept',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Listening on port ${process.env.PORT ?? 3000}...`);
}
bootstrap();
