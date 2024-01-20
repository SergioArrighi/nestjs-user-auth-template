import { ApiProperty } from '@nestjs/swagger';
import { IsAscii, IsEmail } from 'class-validator';

export class Signin {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsAscii()
  password: string;
}
