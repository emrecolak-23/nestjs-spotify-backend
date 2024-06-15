import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './entity/playlist.entity';
import { Song } from 'src/songs/entity/song.entity';
import { User } from 'src/users/entity/user.entity';
import { CreatePlaylistDTO } from './dto';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist) private playlistRepo: Repository<Playlist>,
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(playlistDTO: CreatePlaylistDTO): Promise<Playlist> {
    const playList = new Playlist();
    playList.name = playlistDTO.name;
    const songs = await this.songRepo.findByIds(playlistDTO.songs);
    playList.songs = songs;

    const user = await this.userRepo.findOneBy({ id: playlistDTO.user });
    playList.user = user;

    return await this.playlistRepo.save(playList);
  }
}
