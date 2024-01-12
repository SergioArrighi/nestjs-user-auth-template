import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginBody } from './schemas/login-body.schema';
import * as bcrypt from 'bcrypt';
import { UserJwt } from './schemas/user-jwt.schema';
import { classToClass } from 'class-transformer';

const saltRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const salt = bcrypt.genSaltSync(saltRounds);
    if (user && bcrypt.compareSync(password, user.password)) return user;
    return null;
  }

  async login(body: LoginBody, req: any): Promise<UserJwt> {
    const payload = {
      sub: req.user._id,
      email: body.email,
      roles: req.user.roles,
    };
    const userJwt: UserJwt = {
      user: classToClass(req.user),
      accessToken: this.jwtService.sign(payload),
    };
    return userJwt;
  }

  async passwordHash(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }
}
