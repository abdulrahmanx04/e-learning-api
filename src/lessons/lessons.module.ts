import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lessons } from './entities/lesson.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Courses } from 'src/courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lessons,Courses]),CloudinaryModule],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
