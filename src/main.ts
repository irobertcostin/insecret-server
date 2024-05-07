import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const port = process.env.PORT || 3050
  const port = 3055

  app.useGlobalPipes(new ValidationPipe());


  app.enableCors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Origin', 'XMLHttpRequest', 'X-Requested-With', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
  })

  await app.listen(port);
}
bootstrap();
