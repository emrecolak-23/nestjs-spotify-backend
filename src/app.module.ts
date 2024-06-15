import {
  MiddlewareConsumer,
  Module,
  NestModule,
  // RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { SongsController } from './songs/songs.controller';
import { DevConfigService } from './common/providers/dev-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Song } from './songs/entity/song.entity';
// import { Artist } from './artists/entity/artist.entity';
// import { User } from './users/entity/user.entity';
// import { Playlist } from './playlists/entity/playlist.entity';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { ArtistsModule } from './artists/artists.module';
import * as Joi from 'joi';
import { dataSourceOptions } from 'db/data-source';
import { SeedModule } from './seed/seed.module';
import { JwtAuthGuard } from './common/guards/jwt.guard';

const devConfig = { port: 3000, dbHost: 'localhost' };
const prodConfig = { port: 8080, dbHost: 'production' };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_NAME: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
      }),
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       type: 'postgres',
    //       database: configService.get('DATABASE_NAME'),
    //       host: configService.get('DATABASE_HOST'),
    //       port: configService.get('DATABASE_PORT'),
    //       username: configService.get('DATABASE_USER'),
    //       password: configService.get('DATABASE_PASSWORD'),
    //       synchronize: true,
    //       entities: [Song, Artist, User, Playlist],
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRoot(dataSourceOptions),
    SongsModule,
    AuthModule,
    UsersModule,
    PlaylistsModule,
    ArtistsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: DevConfigService,
      useClass: DevConfigService,
    },
    {
      provide: 'CONFIG',
      useFactory: () => {
        return process.env.NODE_ENV === 'production' ? prodConfig : devConfig;
      },
    },
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {
    console.log('dbName', this.dataSource.driver.database);
  }
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(LoggerMiddleware).forRoutes('songs');
  // } --> option 1

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(LoggerMiddleware)
  //     .forRoutes({ path: 'songs', method: RequestMethod.POST });
  // } --> option 2

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(SongsController);
  } // ---> option 3
}
