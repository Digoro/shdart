import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { CorpService } from './app.service';
import { Corp, Finance } from './entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      autoLoadEntities: true,
      synchronize: false,
      charset: "utf8mb4",
    }),
    TypeOrmModule.forFeature([
      Corp,
      Finance
    ]),
    HttpModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    CorpService,
    AppGateway
  ],
})
export class AppModule { }
