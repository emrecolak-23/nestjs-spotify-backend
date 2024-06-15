import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ArtistsModule } from 'src/artists/artists.module';
import { Artist } from 'src/artists/entity/artist.entity';

@Module({
  imports: [ArtistsModule, TypeOrmModule.forFeature([User, Artist])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
