import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/auth/entities/auth.entity';
import { Courses } from './entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users,Courses]),CloudinaryModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
