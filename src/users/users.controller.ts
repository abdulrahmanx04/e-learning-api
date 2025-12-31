import { Controller, Get, Put,Post,Delete, UseGuards,Body, UseInterceptors, UploadedFile,NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import type { UserData } from 'src/common/all-interfaces/all-interfaces';
import { CurrentUser } from '../common/decorators/current-user';
import { JwtAuthGuard } from '../common/guards/jwt-authguard';
import { UpdateProfileDto } from './dto/profile-dto';
import { PasswordDto } from 'src/auth/dto/auth-dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  findOne(@CurrentUser() userData: UserData) {
    return this.usersService.findOne(userData)
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Put('/me')
  updateOne(@Body() dto: UpdateProfileDto, @CurrentUser() userData: UserData,
  @UploadedFile() file?: Express.Multer.File) {
    return this.usersService.updateOne(dto,userData,file)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  deleteOne(@Body() dto: PasswordDto, @CurrentUser() userData: UserData) {
    return this.usersService.deleteOne(dto,userData)
  }


} 