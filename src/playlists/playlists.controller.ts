import { Body, Controller, Post } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDTO } from './dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private playlistService: PlaylistsService) {}

  @Post()
  async create(@Body() playlistDTO: CreatePlaylistDTO) {
    return this.playlistService.create(playlistDTO);
  }
}
