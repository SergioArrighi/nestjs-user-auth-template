import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UUID {
  @ApiProperty()
  @IsUUID()
  id: string;
}
