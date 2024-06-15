import { Song } from 'src/songs/entity/song.entity';
import { User } from 'src/users/entity/user.entity';
import {
  Entity,
  JoinColumn,
  OneToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('artists')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Song, (song) => song.artists)
  songs: Song[];
}
