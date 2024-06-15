import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from 'src/common/dto';
import { hashData } from 'src/utils/password';
import { UserRoles } from './types/user-role.types';
import { Artist } from 'src/artists/entity/artist.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Artist) private artistRepository: Repository<Artist>,
  ) {}

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const existingUser = await this.findByEmail(createUserDTO.email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = new User();
    user.firstName = createUserDTO.firstName;
    user.lastName = createUserDTO.lastName;
    user.email = createUserDTO.email;
    user.apiKey = uuidv4();
    if (createUserDTO.password) {
      user.password = await hashData(createUserDTO.password);
    }
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUserRole(userId: number, role: UserRoles): Promise<Artist> {
    if (role === UserRoles.ARTIST) {
      const artist = new Artist();
      artist.user = await this.findById(userId);
      return await this.artistRepository.save(artist);
    }
  }

  async updateSecretKey(userId: number, secret: string): Promise<User> {
    const user = await this.findById(userId);
    user.twoFASecret = secret;
    user.enabled2FA = true;
    return await this.userRepository.save(user);
  }

  async disable2FA(userId: number): Promise<User> {
    const user = await this.findById(userId);
    user.twoFASecret = null;
    user.enabled2FA = false;
    return await this.userRepository.save(user);
  }

  async findByApiKey(apiKey: string): Promise<User> {
    return await this.userRepository.findOne({ where: { apiKey } });
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.findById(userId);
    user.refreshToken = refreshToken;
    return await this.userRepository.save(user);
  }
}
