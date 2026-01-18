import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLessonDto, LessonResponseDto, LessonRolesResponseDto, UpdateLessonDto } from './dto/lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lessons } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {  uploadFiles } from 'src/common/utils/upload';
import { FilterOperator, paginate, Paginate, PaginateQuery } from 'nestjs-paginate';
import { Courses } from 'src/courses/entities/course.entity';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserData } from 'src/common/all-interfaces/all-interfaces';

@Injectable()
export class LessonsService {
  constructor(@InjectRepository(Lessons) private lessonRepo: Repository<Lessons>,
  @InjectRepository(Courses) private courseRepo: Repository<Courses>,
  private dataSource: DataSource,
  private cloudinaryService: CloudinaryService) {}
  
  async create(cousrseId: string,createDto: CreateLessonDto, files?: {videos?: Express.Multer.File[], materials?: Express.Multer.File[]})
  : Promise<LessonRolesResponseDto> {
    
    const course= await this.courseRepo.findOneOrFail({where: {id: cousrseId}})
    const [videos, materials]= await Promise.all([
      uploadFiles(this.cloudinaryService,'videos',files?.videos),
      uploadFiles(this.cloudinaryService,'Lesson materials',files?.materials)
    ])

    const lesson= this.lessonRepo.create({
      ...createDto,
      videos,
      materials,
      courseId: cousrseId
    })

    await this.lessonRepo.save(lesson)
    return plainToInstance(LessonRolesResponseDto,lesson,{excludeExtraneousValues: true})
  }

  async findAll(courseId: string,query: PaginateQuery): Promise<{data: LessonResponseDto[], meta: any}> {
    const course= await this.courseRepo.findOneOrFail({where: {id: courseId}})
    const lessons= await paginate(query,this.lessonRepo,{
      sortableColumns: ['createdAt','updatedAt','lessonType','isFree','isPublished'],
      searchableColumns: ['title','description','content'],
      filterableColumns: {
        title: [FilterOperator.ILIKE],
        content: [FilterOperator.ILIKE],
        description: [FilterOperator.ILIKE],
        isFree: [FilterOperator.IN],
        isPublished: [FilterOperator.IN]
      },
      where: {courseId,isPublished: true},
      defaultLimit: 10,
      defaultSortBy: [['createdAt','DESC']],
      maxLimit: 100,
    })
    const dataDto = plainToInstance(LessonResponseDto, lessons.data, { excludeExtraneousValues: true });
    return {
      ...lessons,
      data: dataDto
    };
  }

  async findOne(courseId: string,lessonId: string): Promise<LessonResponseDto> {
    const lesson= await this.lessonRepo.findOneOrFail({where: {
      id: lessonId,
      courseId,
      isPublished: true
    }})
    return plainToInstance(LessonResponseDto,lesson,{excludeExtraneousValues: true})
  }

  async update(courseId: string,lessonId: string,updateDto: UpdateLessonDto,
    user: UserData,
    files?: {videos?: Express.Multer.File[],materials?: Express.Multer.File[] }
  ): Promise<LessonRolesResponseDto> {

    const lesson= await this.lessonRepo.findOneOrFail({where: {id: lessonId,courseId},
      relations: ['course']
    })

    if(lesson.course.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You cannot edit lessons for other teachers')
    }
    const [videos,materials]= await Promise.all([
      uploadFiles(this.cloudinaryService,'videos',files?.videos),
      uploadFiles(this.cloudinaryService,'materials',files?.materials)]
    )

    if(videos.length > 0) {
      lesson.videos= [...lesson.videos,...videos]
    }

    if(materials.length > 0) {
      lesson.materials=[...lesson.materials,...materials]
    }

    Object.assign(lesson,updateDto)

    await this.lessonRepo.save(lesson)

    const updatedLesson = await this.lessonRepo.findOne({
        where: {id: lessonId}
    });

    return plainToInstance(LessonRolesResponseDto,updatedLesson, {excludeExtraneousValues: true})
  }


  async remove(courseId: string, lessonId: string, user: UserData) {
    const lesson = await this.lessonRepo.findOneOrFail({
      where: {
        id: lessonId,
        courseId
      },
      relations: ['course']
    });
    
    if(lesson.course.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You cannot delete this lesson');
    }
   
      await Promise.all([
        ...lesson.videos.map(video => {
          return this.cloudinaryService.deleteFile(video.publicId, 'video');
        }),
        ...lesson.materials.map(material => {
          const resourceType = material.url.includes('/image/') ? 'image' 
                : material.url.includes('/video/') ? 'video' 
                : 'raw';
          return this.cloudinaryService.deleteFile(material.publicId, resourceType);
        })
      ])
    
    await this.lessonRepo.delete({id: lessonId});
    return 
}
}
