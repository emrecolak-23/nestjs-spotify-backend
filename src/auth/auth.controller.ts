import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Res,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateUserDTO } from 'src/common/dto';
import { LoginDTO } from './dto';
import { AuthService } from './auth.service';
import { Enable2FAType } from './types/2fa.type';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Response } from 'express';
import { User } from 'src/users/entity/user.entity';
import { Validate2FADTO } from './dto/validate-2fa.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from '../common/guards/google.guard';
import { TokensType } from './types/tokens.type';
import { RefreshJwtAuthGuard } from '../common/guards/refresh-jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDTO: CreateUserDTO): Promise<TokensType> {
    return await this.authService.signUp(createUserDTO);
  }

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: LoginDTO) {
    return await this.authService.login(loginDTO);
  }

  @Get('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User) {
    return await this.authService.logout(user.id);
  }

  @Get('/enable-2fa')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async enable2FA(@CurrentUser() user: User): Promise<Enable2FAType> {
    return await this.authService.enable2FA(user.id);
  }

  @Post('/verify-2fa')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Body() validate2FADTO: Validate2FADTO,
    @CurrentUser() user: User,
  ) {
    return await this.authService.verify2FA(user.id, validate2FADTO.token);
  }

  @Get('/disable-2fa')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disable2FA(@CurrentUser() user: User) {
    return await this.authService.disable2FA(user.id);
  }

  @Get('/profile')
  @UseGuards(AuthGuard('bearer'))
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return 'This route is for google login';
  }

  @Get('/refresh-token')
  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@CurrentUser() user: User) {
    return await this.authService.refreshToken(user.id, user.refreshToken);
  }

  @Get('/google/redirect')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.OK)
  async googleLoginRedirect(
    @CurrentUser() user: User,
    @Res() response: Response,
  ) {
    const [accessToken, refreshToken] =
      await this.authService.getAccessRefreshTokensAndUpdateRefreshToken(user);
    response.redirect(
      `http://localhost:3000/?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }
}
