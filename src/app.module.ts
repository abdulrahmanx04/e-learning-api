import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollment/enrollment.module';
import * as dotenv from 'dotenv'
import { Users } from './auth/entities/auth.entity';
import { Courses } from './courses/entities/course.entity';
import { Enrollments } from './enrollment/entities/enrollment.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
dotenv.config()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      entities: [Users,Courses,Enrollments],
      synchronize: true
    }),
    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    CloudinaryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
