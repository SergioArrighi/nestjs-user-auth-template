import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UUIDs {
  @ApiPropertyOptional({ type: () => [String] })
  @IsOptional()
  @IsUUID('all', { each: true })
  uuids: string[];
}
