import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { UserIdGuard } from './user-id.guard';
import { UpdateUser, User } from './schemas/user.schema';
import { Role } from './role/role.enum';
import { UserService } from './user.service';
import { UUID } from './dtos/uuid.dto';
import { UUIDs } from './dtos/uuids.dto';

@ApiSecurity('X-API-Key', ['X-API-Key'])
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({ type: () => User })
  @ApiResponse({ type: User })
  @Post()
  @Auth(Role.Admin)
  async create(@Body() user: User): Promise<User> {
    return this.userService.create(user);
  }

  @ApiBody({ type: () => [User] })
  @ApiResponse({ type: [User] })
  @Post('all')
  @Auth(Role.Admin)
  async createAll(
    @Body(new ParseArrayPipe({ items: User })) users: User[],
  ): Promise<User[]> {
    return this.userService.createAll(users);
  }

  @ApiResponse({ type: [User] })
  @Get()
  @Auth(Role.Admin, Role.Robot)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @ApiResponse({ type: User })
  @Get(':id')
  @UseGuards(UserIdGuard)
  @Auth(Role.Admin, Role.Robot, Role.User)
  async findOne(@Param() params: UUID): Promise<User> {
    return this.userService.findOne(params.id);
  }

  @ApiBody({ type: () => UpdateUser })
  @Patch(':id')
  @HttpCode(204)
  @UseGuards(UserIdGuard)
  @Auth(Role.Admin, Role.User)
  async update(@Param() params: UUID, @Body() user: UpdateUser) {
    this.userService.update(params.id, user);
  }

  @ApiBody({ type: () => UUIDs })
  @Delete()
  @HttpCode(204)
  @Auth(Role.Admin)
  async remove(@Body() ids: UUIDs) {
    return this.userService.removeMany(ids.uuids);
  }
}
