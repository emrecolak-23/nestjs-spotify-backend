import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entity/playlist.entity';
import { User } from 'src/users/entity/user.entity';
import { Song } from 'src/songs/entity/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, User, Song])],
  providers: [PlaylistsService],
  controllers: [PlaylistsController],
})
export class PlaylistsModule {}
