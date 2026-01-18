import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFiles, UseInterceptors, Put, HttpCode } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-authguard';
import { Roles } from 'src/common/decorators/admin-decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/common/guards/roles-guard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import type { UserData } from 'src/common/all-interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user';

@Controller('courses/:courseId/lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

 
  @UseGuards(RolesGuard)
  @Roles('admin','teacher')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'videos', maxCount: 10},
    {name: 'materials', maxCount: 10}
  ]))
  @Post('')
  create(@Param('courseId') courseId: string,
  @Body() createLessonDto: CreateLessonDto,
  @UploadedFiles() files?: {videos?: Express.Multer.File[], materials?: Express.Multer.File[]}
) {
    return this.lessonsService.create(courseId,createLessonDto,files);
  }

  
  @Get('')
  findAll(@Param('courseId') courseId: string,
  @Paginate() query: PaginateQuery) {
    return this.lessonsService.findAll(courseId,query);
  }

  @Get('/:id')
  findOne(@Param('courseId') courseId: string,
  @Param('id') id: string) {
    return this.lessonsService.findOne(courseId,id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin','teacher')
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'videos', maxCount: 10},
    {name: 'materials', maxCount: 10},
  ]))
  @Put(':id')
  update(
  @Param('courseId') courseId: string,
  @Param('id') id: string,
  @Body() dto: UpdateLessonDto,
  @CurrentUser() user: UserData,
  @UploadedFiles() files?: {videos: Express.Multer.File[], materials?: Express.Multer.File[]}
  ) {
    return this.lessonsService.update(courseId,id,dto,user,files);
  } 

  @UseGuards(RolesGuard)
  @Roles('teacher','admin')
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('courseId') courseId: string ,@Param('id') id: string,
  @CurrentUser() user: UserData
) {
    return this.lessonsService.remove(courseId,id,user);
  }
}
