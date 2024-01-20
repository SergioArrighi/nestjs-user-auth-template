import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { instanceToInstance } from 'class-transformer';
import { UserService } from '@/user/user.service';
import { Signin } from './dtos/signin.dto';
import { UserJwt } from './dtos/user-jwt.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) return user;
    return null;
  }

  async signin(body: Signin, req: any): Promise<UserJwt> {
    const payload = {
      sub: req.user._id,
      email: body.email,
      roles: req.user.roles,
    };
    const userJwt: UserJwt = {
      user: instanceToInstance(req.user),
      accessToken: this.jwtService.sign(payload),
    };
    return userJwt;
  }

  async passwordHash(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(this.configService.getOrThrow('APP_SALT'));
    return bcrypt.hashSync(password, salt);
  }
}
