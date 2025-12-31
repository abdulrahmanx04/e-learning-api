import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, Put } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/course.dto';
import { UpdateCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-authguard';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Paginate  } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { RolesGuard } from 'src/common/guards/roles-guard';
import { Roles } from 'src/common/decorators/admin-decorator';
@Controller('courses')

export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}


  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin', 'teacher')
  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      {name: 'thumbnail', maxCount: 1},
      {name: 'materials', maxCount: 10}
    ])
  )
  create(@Body() createCourseDto: CreateCourseDto, @UploadedFiles()
  files?: {thumbnail: Express.Multer.File[], materials: Express.Multer.File[]}
  ) {
      return this.coursesService.create(createCourseDto,files);
    }

  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
    return this.coursesService.findAll(query);
  }
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin','teacher')
  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      {name: 'thumbnail', maxCount: 1},
      {name: 'materials',maxCount: 10}])
  )
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto,
  @UploadedFiles()  files?: {
    thumbnail?: Express.Multer.File[], materials?: Express.Multer.File[]
  }
) {
    return this.coursesService.update(id,updateCourseDto,files);
  }
  
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}
