import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsAscii,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../role/role.enum';
import { PartialType } from '@nestjs/mapped-types';

export enum Active {
  No = 'no',
  Pending = 'pending',
  Yes = 'yes',
}

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  id: true,
})
export class User {
  constructor(partial?: Partial<User>) {
    if (partial) Object.assign(this, partial);
  }

  @IsOptional()
  @IsUUID()
  @Prop({ type: Object, default: uuidv4, required: false })
  @Exclude({ toPlainOnly: true })
  _id?: object;

  @ApiPropertyOptional({ type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsEmail()
  @Prop({ unique: true, required: true })
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Prop({ required: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty()
  @MaxLength(100)
  @IsAscii()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @MaxLength(100)
  @IsAscii()
  @Prop({ required: true })
  surname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsAscii()
  @MaxLength(250)
  @Prop()
  description: string;

  @ApiPropertyOptional({ enum: Role, enumName: 'Role', isArray: true })
  @IsOptional()
  @IsArray()
  @Prop({ default: [Role.User] })
  roles: Role[];

  @ApiPropertyOptional({ enum: Active, enumName: 'Active' })
  @IsOptional()
  @IsEnum(Active)
  @Prop({ required: false, default: Active.No })
  active: Active;
}

const UserSchema = SchemaFactory.createForClass(User);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
UserSchema.plugin(mongooseLeanVirtuals);
export { UserSchema };

export class UpdateUser extends PartialType(User) {}
