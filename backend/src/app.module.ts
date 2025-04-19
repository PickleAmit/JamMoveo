import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { SongModule } from './song/song.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '', 10) ?? 5432,
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASS ?? '123456Amit',
      database: process.env.DB_NAME ?? 'jamoveo',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production!
    }),
    UsersModule,
    EventsModule,
    SongModule,
    // ...other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
