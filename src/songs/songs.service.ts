import { Injectable, Scope } from '@nestjs/common';
import { Song } from './entity/song.entity';
import { Artist } from 'src/artists/entity/artist.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateSongDTO, UpdateSongDTO } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable({ scope: Scope.TRANSIENT })
export class SongsService {
  constructor(
    @InjectRepository(Song) private songRepository: Repository<Song>,
    @InjectRepository(Artist) private artistRepository: Repository<Artist>,
  ) {}

  async paginate(options: IPaginationOptions): Promise<Pagination<Song>> {
    const queryBuilder = this.songRepository.createQueryBuilder('c');
    queryBuilder.orderBy('c.releasedDate', 'DESC');
    return paginate<Song>(queryBuilder, options);
  }

  async create(createSongDTO: CreateSongDTO): Promise<Song> {
    const song = new Song();
    song.title = createSongDTO.title;
    song.releasedDate = createSongDTO.releasedDate;
    song.duration = createSongDTO.duration;
    song.lyrics = createSongDTO.lyrics;

    const artistIds = createSongDTO.artists;

    const artists = await Promise.all(
      artistIds.map(async (artistId: number) => {
        return await this.artistRepository.findOne({ where: { id: artistId } });
      }),
    );

    if (artists.includes(undefined)) {
      throw new Error('Invalid artist id(s)');
    }
    song.artists = artists;

    return await this.songRepository.save(song);
  }

  async findAll(): Promise<Song[]> {
    return await this.songRepository.find();
  }

  async findOne(id: number): Promise<Song> {
    return await this.songRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.songRepository.delete(id);
  }

  async update(
    id: number,
    updateSongDTO: UpdateSongDTO,
  ): Promise<UpdateResult> {
    return await this.songRepository.update(id, updateSongDTO);
  }
}
