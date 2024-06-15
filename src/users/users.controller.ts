import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { Request } from 'express';
import { User } from './entity/user.entity';
import { UpdateUserRoleDTO } from './dto/update-user-role.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/update-user-role')
  @UseGuards(JwtAuthGuard)
  async updateUserRole(
    @Body() updateUserRoleDTO: UpdateUserRoleDTO,
    @Req() request: Request,
  ) {
    const user = request.user as User;
    return await this.usersService.updateUserRole(
      user.id,
      updateUserRoleDTO.role,
    );
  }
}
