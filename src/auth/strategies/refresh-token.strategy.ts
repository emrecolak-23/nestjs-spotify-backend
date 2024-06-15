import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { userId: number; email: string; artistId?: number },
  ) {
    const authorizationHeader = req.get('Authorization');

    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }

    const refreshToken = authorizationHeader.replace('Bearer ', '').trim();
    console.log('refreshToken', refreshToken);
    return {
      id: payload.userId,
      email: payload.email,
      ...(payload.artistId && { artistId: payload.artistId }),
      refreshToken,
    };
  }
}
