import { BadRequestException, Body, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/course.dto';
import { UpdateCourseDto } from './dto/course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { Courses } from './entities/course.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { MaterialsUpload, UserData } from 'src/common/all-interfaces/all-interfaces';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class CoursesService {
  constructor(@InjectRepository(Users) private userRepo: Repository<Users>,
   @InjectRepository(Courses) private courseRepo: Repository<Courses>,
   private cloudinaryService: CloudinaryService
) {}
  
  async create(createCourseDto: CreateCourseDto,
    files?: {thumbnail?:  Express.Multer.File[], materials?: Express.Multer.File[]}
  ) {
    const teacher= await this.userRepo.findOneOrFail({
      where: {
        id: createCourseDto.userId
      }
    })


    const [thumbnail, materials]: [UploadApiResponse | null, MaterialsUpload[] | []]= await Promise.all([
      files?.thumbnail?.length
      ? this.cloudinaryService.uploadFile(files.thumbnail[0],'thumbnail')
      : null,
      files?.materials?.length
        ? Promise.all(
          files.materials.map(async(file) => {
            const upload= await this.cloudinaryService.uploadFile(file, 'materials')
            return {
              url: upload.secure_url,
              fileName:upload.display_name,
              publicId: upload.public_id,
              size: +(upload.bytes / (1024 * 1024)).toFixed(2)
            }
          })
        )
      : []
    ])

    const course= this.courseRepo.create({
      ...createCourseDto,
      thumbnailUrl: thumbnail?.secure_url,
      thumbnailPublicId: thumbnail?.public_id,
      materials,
      teacher
    }) 

     await this.courseRepo.save(course)

     return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        teacher: course.teacher.name,
        thumbnailUrl: course.thumbnailUrl,
        materials: course.materials
     }
  } 

  async findAll(query: PaginateQuery) {
    const courses= await paginate(query,this.courseRepo,{
      sortableColumns: ['createdAt','updatedAt','title','price','rating'],
      searchableColumns: ['title','description','category','level'],
      filterableColumns: {
        price: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
        'teacher.name': [FilterOperator.ILIKE],
        category: [FilterOperator.EQ,FilterOperator.IN],
        level: [FilterOperator.EQ,FilterOperator.IN],
      },
      where: {isPublished: true},
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
    return {
      data: courses.data,
      meta: courses.meta
    }
  }

  async findOne(id: string) {
    const course= await this.courseRepo.findOneOrFail({
      where: {
        id
      },
      relations: ['teacher']
    }) 

    return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        category: course.category,
        level: course.level,
        duration: course.duration,
        teacher: course.teacher.name,
        thumbnailUrl: course.thumbnailUrl,
     }
  }

  
  async update(id: string, updateCourseDto: UpdateCourseDto, files?: {
    thumbnail?: Express.Multer.File[], materials?: Express.Multer.File[]
  }) {
      const course = await this.courseRepo.findOneOrFail({where: {
        id,
      }})

    if(files?.thumbnail?.length) {
      const upload: UploadApiResponse= await this.cloudinaryService.uploadFile(files.thumbnail[0],'thumbnail')
      course.thumbnailUrl= upload.secure_url
      course.thumbnailPublicId= upload.public_id
    }

    if(files?.materials?.length) {
      const materials= await Promise.all(
        files.materials.map(async(file) => {
          const upload: UploadApiResponse= await this.cloudinaryService.uploadFile(file, 'materials')
            return {
              url: upload.secure_url,
              fileName:upload.display_name,
              publicId: upload.public_id,
              size: +(upload.bytes / (1024 * 1024)).toFixed(2)
            } 
        })
      )
      course.materials= materials
    }
    this.courseRepo.merge(course,updateCourseDto)
    return await this.courseRepo.save(course)
  }

  async delete(id: string) {
    const course= await this.courseRepo.findOneOrFail({where: {id}})

    if(course.thumbnailPublicId) {
      await this.cloudinaryService.deleteFile(course.thumbnailPublicId)
    }
    if(course.materials?.length) {
      await Promise.all(course.materials?.map(async(file) => {
        await this.cloudinaryService.deleteFile(file.publicId)
      }))
    }

    await this.courseRepo.remove(course)

    return
  }
}
