import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Playlist } from 'src/playlists/entity/playlist.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'text' })
  @Exclude()
  password?: string;

  @Column()
  apiKey: string;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string;

  @Column({ nullable: true, type: 'text' })
  twoFASecret: string;

  @Column({ default: false, type: 'boolean' })
  enabled2FA: boolean;

  @OneToMany(() => Playlist, (playList) => playList.user)
  playLists: Playlist[];
}
