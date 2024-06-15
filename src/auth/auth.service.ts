import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { LoginDTO } from './dto';
import { CreateUserDTO } from 'src/common/dto';
import { UsersService } from 'src/users/users.service';
import { compareData, hashData } from 'src/utils/password';
import { JwtService } from '@nestjs/jwt';
import { ArtistsService } from 'src/artists/artists.service';
import { PayloadType } from './types/payload.type';
import { Enable2FAType } from './types/2fa.type';
import { User } from 'src/users/entity/user.entity';
import { GoogleUserType } from './types/google-user.type';
import { ConfigService } from '@nestjs/config';
import { TokensType } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly artistService: ArtistsService,
  ) {}

  async login(
    loginDTO: LoginDTO,
  ): Promise<TokensType | { validate2FA: string; message: string }> {
    const user = await this.validateUser(loginDTO.email, loginDTO.password);

    if (user.enabled2FA && user.twoFASecret) {
      return {
        validate2FA: 'http://localhost:3000/auth/verify-2fa',
        message:
          'Please send the one time password/token from your authenticator app',
      };
    }

    const [accessToken, refreshToken] =
      await this.getAccessRefreshTokensAndUpdateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(createUserDTO: CreateUserDTO): Promise<TokensType> {
    const user = await this.usersService.create(createUserDTO);

    const [accessToken, refreshToken] =
      await this.getAccessRefreshTokensAndUpdateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  async enable2FA(userId: number): Promise<Enable2FAType> {
    const user = await this.usersService.findById(userId);
    if (user.enabled2FA) {
      return { secret: user.twoFASecret };
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    user.twoFASecret = secret.base32;
    await this.usersService.updateSecretKey(user.id, user.twoFASecret);
    return { secret: user.twoFASecret };
  }

  async verify2FA(
    userId: number,
    token: string,
  ): Promise<
    {
      verified: boolean;
    } & TokensType
  > {
    const user = await this.usersService.findById(userId);
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      const [accessToken, refreshToken] =
        await this.getAccessRefreshTokensAndUpdateRefreshToken(user);
      return { verified: true, accessToken, refreshToken };
    }

    return { verified: false, accessToken: null, refreshToken: null };
  }

  async disable2FA(userId: number): Promise<User> {
    return await this.usersService.disable2FA(userId);
  }

  async validateUserByApiKey(apiKey: string): Promise<User> {
    return await this.usersService.findByApiKey(apiKey);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const passwordMatch = await compareData(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async validateGoogleUser(googleUser: GoogleUserType): Promise<User> {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      user = await this.usersService.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        password: null,
      });
    }

    return user;
  }

  async getTokens(
    user: User,
    isRefreshToken: boolean = false,
  ): Promise<string> {
    const payload: PayloadType = { email: user.email, userId: user.id };
    const artist = await this.artistService.findArtist(user.id);
    if (artist) {
      payload['artistId'] = artist.id;
    }

    const token = await this.jwtService.signAsync(payload, {
      secret: isRefreshToken
        ? this.configService.get('REFRESH_TOKEN_SECRET')
        : this.configService.get('JWT_SECRET'),
      expiresIn: isRefreshToken
        ? this.configService.get('REFRESH_TOKEN_EXPIRATION')
        : this.configService.get('JWT_EXPIRATION'),
    });
    return token;
  }

  async getAccessRefreshTokensAndUpdateRefreshToken(
    user: User,
  ): Promise<[string, string]> {
    const accessToken = await this.getTokens(user);
    const refreshToken = await this.getTokens(user, true);
    await this.updateRefreshToken(user.id, refreshToken);
    return [accessToken, refreshToken];
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    if (!user.refreshToken) {
      throw new ForbiddenException('User does not have a refresh token');
    }

    const refreshTokenMatch = await compareData(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [accessToken, newRefreshToken] =
      await this.getAccessRefreshTokensAndUpdateRefreshToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await hashData(refreshToken);
    return await this.usersService.updateRefreshToken(
      userId,
      hashedRefreshToken,
    );
  }
}
