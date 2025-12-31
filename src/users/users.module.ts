import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/auth/entities/auth.entity';
import { UserController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Users]),CloudinaryModule],
  controllers: [UserController],
  providers: [UsersService],
})
export class UsersModule {}
