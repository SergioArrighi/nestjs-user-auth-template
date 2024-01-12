import {
  Controller,
  Post,
  UseGuards,
  Body,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLoginInterceptor } from '../interceptor/message-broker/user-login.interceptor';
import { Role } from '@/user/role/role.enum';
import { User } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginBody } from './schemas/login-body.schema';
import { LocalAuthGuard } from './local-auth.guard';
import { UserJwt } from './schemas/user-jwt.schema';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiBody({ type: () => LoginBody })
  @ApiResponse({ type: () => UserJwt })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UseInterceptors(UserLoginInterceptor)
  async login(@Body() body: LoginBody, @Req() req: any): Promise<UserJwt> {
    return await this.authService.login(body, req);
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
