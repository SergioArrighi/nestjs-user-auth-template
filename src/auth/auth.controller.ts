import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@/user/role/role.enum';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Signin } from './dtos/signin.dto';
import { UserJwt } from './dtos/user-jwt.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({ type: () => Signin })
  @ApiResponse({ type: () => UserJwt })
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Body() body: Signin, @Req() req: any): Promise<UserJwt> {
    return await this.authService.signin(body, req);
  }

  @ApiBody({ type: User })
  @Post('signup')
  async signup(@Body() body: User) {
    await this.authService
      .passwordHash(body.password)
      .then((value) => (body.password = value));
    body.roles = [Role.User];
    this.userService.create(body);
  }
}
