import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdminCourseService } from "../services/admin.courses.service";
import { JwtAuthGuard } from "src/common/guards/AuthGuard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/role.decorator";
import { Paginate } from "nestjs-paginate";
import type { PaginateQuery } from "nestjs-paginate";
import { CoursePublishDto } from "../dto/admin.courses.dto";
import { CreateCourseDto } from "src/courses/dto/course.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "src/common/decorators/current-user";
import type { UserData } from "src/common/all-interfaces/all-interfaces";



@Controller('admin/courses')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
export class AdminCoursesController {
    constructor(private adminCourseService: AdminCourseService){}

    @UseInterceptors(FileFieldsInterceptor([
        {name: 'thumbnail', maxCount: 1},
        {name: 'materials', maxCount: 10}
    ]))
    @Post('')
    create(@Body() dto: CreateCourseDto, @CurrentUser() admin: UserData,
    @UploadedFiles() files?: {thumbnail?: Express.Multer.File[], materials?: Express.Multer.File[]}) {
        return this.adminCourseService.create(dto,admin,files)
    }

    
    @Get('')
    findAll(@Paginate() query: PaginateQuery){
        return this.adminCourseService.findAll(query)
    }

    
    @Get('stats')
    coursesStats(){
        return this.adminCourseService.getCoursesStats()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminCourseService.findOne(id)
    }

    @Patch(':id/publish')
    updatePublish(@Param('id') id: string, @Body() dto: CoursePublishDto){
        return this.adminCourseService.updatePublish(id,dto)
    }

    @Delete(':id')
    deleteCourse(@Param('id') id: string) {
        return this.adminCourseService.delete(id)
    }
}