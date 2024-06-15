import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
// import { connection } from 'src/common/constants/connection';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entity/song.entity';
import { Artist } from 'src/artists/entity/artist.entity';

// const mockSongsService = {
//   create: () => ['test'],
//   findAll: () => ['test'],
//   findOne: () => ['test'],
//   update: () => ['test'],
//   remove: () => ['test'],
// };

@Module({
  imports: [TypeOrmModule.forFeature([Song, Artist])],
  controllers: [SongsController],
  providers: [
    SongsService,
    // {
    //   provide: SongsService,
    //   useClass: SongsService,
    // },
    // {
    //   provide: SongsService,
    //   useValue: mockSongsService,
    // },
    // {
    //   provide: 'CONNECTION',
    //   useValue: connection,
    // },
  ],
})
export class SongsModule {}
