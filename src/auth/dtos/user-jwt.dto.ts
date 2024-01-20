import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsJWT } from 'class-validator';
import { User } from '@/user/schemas/user.schema';

export class UserJwt {
  @ApiProperty({ type: () => User })
  @Type(() => User)
  user: User;

  @ApiProperty()
  @IsJWT()
  accessToken: string;
}
