import { BadRequestException, Body, ForbiddenException, Injectable } from '@nestjs/common';
import { CourseResponseDto, CreateCourseDto, RolesResponseCourseDto } from './dto/course.dto';
import { UpdateCourseDto } from './dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { Courses } from './entities/course.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { uploadFiles } from 'src/common/utils/upload';
import { UserData } from 'src/common/all-interfaces/all-interfaces';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CoursesService {
  constructor(@InjectRepository(Users) private userRepo: Repository<Users>,
   @InjectRepository(Courses) private courseRepo: Repository<Courses>,
   private cloudinaryService: CloudinaryService
) {}
 
  async create(createCourseDto: CreateCourseDto,
    user: UserData,
    files?: {thumbnail?:  Express.Multer.File[], materials?: Express.Multer.File[]}
  ): Promise<RolesResponseCourseDto> {
    

    const [thumbnailArray,materials]= await Promise.all([
      uploadFiles(this.cloudinaryService,'thumbnails',files?.thumbnail),
      uploadFiles(this.cloudinaryService,'materials',files?.materials)
    ])

    const thumbnail= thumbnailArray[0]
  
    const course= this.courseRepo.create({
      ...createCourseDto,
      thumbnailUrl: thumbnail?.url,
      thumbnailPublicId: thumbnail?.publicId,
      materials,
      userId: user.id
    }) 

     await this.courseRepo.save(course)
     return plainToInstance(RolesResponseCourseDto,course,{excludeExtraneousValues: true})
  } 

  async findAll(query: PaginateQuery): Promise<{data: CourseResponseDto[], meta: any}> {
    const courses= await paginate(query,this.courseRepo,{
      sortableColumns: ['createdAt','updatedAt','title','price','rating'],
      searchableColumns: ['title','description','category','level'],
      filterableColumns: {
        price: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
        'teacher.name': [FilterOperator.ILIKE],
        category: [FilterOperator.IN],
        level: [FilterOperator.IN],
      },
      where: {isPublished: false},
      relations: ['teacher'],
      select: [
        'id',
        'title',
        'description',
        'price',
        'category',
        'level',
        'rating',
        'enrollmentCount',
        'duration',
        'thumbnailUrl',
        'createdAt',
        'updatedAt',
        'teacher.name',
        'teacher.avatar'
      ],
      defaultLimit: 10,
      maxLimit: 100,
      defaultSortBy: [['createdAt', 'DESC']]
    })
    const dataDto= plainToInstance(CourseResponseDto,courses.data,{excludeExtraneousValues: true})
    return {
      ...courses,
      data: dataDto
    }
  }

  async findOne(id: string): Promise<CourseResponseDto> {
    const course= await this.courseRepo.findOneOrFail({
      where: {
        id,
        isPublished: false
      },
      relations: ['teacher']
    }) 

    return plainToInstance(CourseResponseDto,course,{excludeExtraneousValues: true})
   
  }

  
  async update(id: string, updateCourseDto: UpdateCourseDto, user: UserData,files?: {
    thumbnail?: Express.Multer.File[], materials?: Express.Multer.File[]
  }): Promise<RolesResponseCourseDto> {

        const course = await this.courseRepo.findOneOrFail({where: {
          id
        }})
        if(course.userId !== user.id && user.role !== 'admin') {
          throw new ForbiddenException('You cant update this course')
        }
        const [thumbnails,materials]= await Promise.all([
        uploadFiles(this.cloudinaryService,'thumbnail',files?.thumbnail),
        uploadFiles(this.cloudinaryService,'materials',files?.materials),
      ])
        if(thumbnails.length > 0) {
          const thumbnail= thumbnails[0]
          course.thumbnailUrl= thumbnail.url
          course.thumbnailPublicId= thumbnail.publicId
        }
        if(materials.length > 0) {
          course.materials= [...course.materials,...materials]
        }

        Object.assign(course,updateCourseDto)

        await this.courseRepo.save(course)

        const updatedCourse= await this.courseRepo.findOneOrFail({where: {id}})

        return plainToInstance(RolesResponseCourseDto,updatedCourse,{excludeExtraneousValues: true})

  }

  async delete(id: string,user: UserData) {
    const course= await this.courseRepo.findOneOrFail({where: {id}})
    if(course.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You cant delete this course')
    }
    if(course.thumbnailPublicId) {
      await this.cloudinaryService.deleteFile(course.thumbnailPublicId,'image')
    }
    if(course.materials?.length) {
      await Promise.all(course.materials?.map(async(file) => {
        const resource_type= file.url.includes('/image/') ? 'image'
        : file.url.includes('/video/') ?  'video'
        : 'raw'
        await this.cloudinaryService.deleteFile(file.publicId,resource_type)
      }))
    }
    await this.courseRepo.remove(course)
    return
  }
}
