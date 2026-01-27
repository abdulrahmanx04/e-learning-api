import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { FilterOperator, paginate, PaginateQuery } from "nestjs-paginate";
import {  CreateCourseDto, RolesResponseCourseDto } from "src/courses/dto/course.dto";
import { Courses } from "src/courses/entities/course.entity";
import { Repository } from "typeorm";
import { CoursePublishDto } from "../dto/admin.courses.dto";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { uploadFiles } from "src/common/utils/upload";
import { UserData } from "src/common/all-interfaces/all-interfaces";



@Injectable()
export class AdminCourseService {
    constructor(@InjectRepository(Courses) private courseRepo: Repository<Courses>,
    private cloudinaryService: CloudinaryService
){} 
    async create(dto: CreateCourseDto, admin: UserData,files?: {thumbnail?: Express.Multer.File[], materials?: Express.Multer.File[]}) {
        
        const [thumbnailArray,materials] = await Promise.all([
            uploadFiles(this.cloudinaryService,'thumbnail',files?.thumbnail),
            uploadFiles(this.cloudinaryService,'materials',files?.materials)
        ])
        const thumbnail= thumbnailArray[0]
        const course= this.courseRepo.create({
            ...dto,
            thumbnailUrl: thumbnail.url,
            thumbnailPublicId: thumbnail.publicId,
            materials: materials ?? [],
            userId: admin.id
        })

        await this.courseRepo.save(course)

        return plainToInstance(RolesResponseCourseDto,course, {excludeExtraneousValues: true})
    }

    async findAll(query: PaginateQuery) {
        const courses= await paginate(query,this.courseRepo,{
            sortableColumns: ['isFree','isPublished','createdAt','updatedAt','price','level'],
            searchableColumns: ['title','description','instructor.name'],
            filterableColumns: {
                category: [FilterOperator.IN],
                level: [FilterOperator.IN],
                rating: [FilterOperator.GTE, FilterOperator.LTE,FilterOperator.BTW],
                isFree: [FilterOperator.EQ],
                isPublished: [FilterOperator.EQ]
            },
            relations: ['instructor'],
            defaultLimit: 10,
            maxLimit: 10,
            defaultSortBy: [['createdAt','DESC']]
        })

        const dataDto= plainToInstance(RolesResponseCourseDto,courses.data, {excludeExtraneousValues: true})
        return {
            ...courses,
            data: dataDto
        }
    }

    async findOne(id: string) {
        const course= await this.courseRepo.findOneOrFail({where: {id},relations: ['instructor']})
        return  plainToInstance(RolesResponseCourseDto,course,{excludeExtraneousValues: true})
    }

    async getCoursesStats() {
        const [
           total,
           free,
           notfree,
           published,
           unpublished,
          ]= 
          await Promise.all([
             this.courseRepo.count(),
             this.courseRepo.count({ where: { isFree: true } }),
             this.courseRepo.count({ where: { isFree: false } }),
             this.courseRepo.count({ where: { isPublished: true } }),
             this.courseRepo.count({ where: { isPublished: false } }),
          ])
          return {
            total,
            free,
            notfree,
            published,
            unpublished,
          }
    }

    async updatePublish(id: string, dto: CoursePublishDto ) {
        const course =await this.courseRepo.findOneOrFail({where: {id}})
        course.isFree= dto.isFree
        course.isPublished= dto.isPublished
        await this.courseRepo.save(course)
        return  plainToInstance(RolesResponseCourseDto,course,{excludeExtraneousValues: true})
    }
    
    async delete(id: string) {
        const course =await this.courseRepo.findOneOrFail({where: {id}})
        await this.deleteCourseMaterials(course)
        await this.courseRepo.delete({id})
    }

    private async deleteCourseMaterials(course: Courses) {
        if(course.materials) {
            course.materials.map(async(file) => {
              const result=  await this.cloudinaryService.deleteFile(file.publicId)
            
            })
        }
        if(course.thumbnailUrl) {
            await this.cloudinaryService.deleteFile(course.thumbnailPublicId)
        }
        return
    }

}