import { Module } from '@nestjs/common';
import { AdminUserService } from './services/admin.users.service';
import { AdminUserController } from './controllers/admin.users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/auth/entities/auth.entity';
import { Courses } from 'src/courses/entities/course.entity';
import { AdminCoursesController } from './controllers/admin.courses.controller';
import { AdminCourseService } from './services/admin.courses.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AdminEnrollmentsService } from './services/admin.enrollments.service';
import { AdminEnrollmentsController } from './controllers/admin.enrollments.controller';
import { Enrollments } from 'src/enrollment/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users,Courses,Enrollments]),CloudinaryModule],
  controllers: [AdminUserController,AdminCoursesController,AdminEnrollmentsController],
  providers: [AdminUserService,AdminCourseService,AdminEnrollmentsService],
})
export class AdminModule {}
