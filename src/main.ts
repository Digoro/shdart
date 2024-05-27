import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  process.on('SIGINT', () => {
    app.close().then(() => {
      process.exit(0);
    })
  })

  app.listen(3000).then(() => {
    if (process.send) {
      process.send('ready');
    }
  })
}
bootstrap();
