import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Role } from './user/role/role.enum';
//import * as fs from "fs";

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  //const fs = require('fs');

  /*
  const keyFile = fs.readFileSync(__dirname + '/../.ssl/server.key');
  const certFile = fs.readFileSync(__dirname + '/../.ssl/server.crt');
  const caFile = fs.readFileSync(__dirname + '/../.ssl/ca.crt');

  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: keyFile,
      cert: certFile,
      ca: caFile,
    },
  });
  */

  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS User Auth')
    .setDescription('Template for user authentication and role based authorization')
    .setVersion('0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      //disableErrorMessages: true,
      transform: true,
      transformOptions: {
        groups: Object.values(Role),
      },
    }),
  );
  app.enableCors();

  await app.listen(app.get(ConfigService).get('APP_BE_PORT'), '0.0.0.0');
}
bootstrap();
