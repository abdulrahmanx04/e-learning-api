import {  Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enrollments, EnrollStatus } from './entities/enrollment.entity';
import { Repository } from 'typeorm';
import { Courses } from 'src/courses/entities/course.entity';
import { UserData } from 'src/common/all-interfaces/all-interfaces';
import { FilterOperator, paginate,  PaginateQuery } from 'nestjs-paginate';
import { plainToInstance } from 'class-transformer';
import { EnrollResponseDto } from './dto/enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(@InjectRepository(Enrollments) private enrollRepo: Repository<Enrollments>,
  @InjectRepository(Courses) private courseRepo: Repository<Courses>
) {}
  async create(courseId: string, user: UserData): Promise<EnrollResponseDto>  {
    const course= await this.courseRepo.findOneOrFail({where: {id: courseId},relations:['instructor']})

    const enroll= this.enrollRepo.create({
      userId: user.id,
      course,
      status: EnrollStatus.PENDING,
    })

    await this.enrollRepo.save(enroll)

    return plainToInstance(EnrollResponseDto,enroll,{excludeExtraneousValues: true})
  }
  
  async findAll( query: PaginateQuery, user: UserData): Promise<{data: EnrollResponseDto[], meta: any}> {
    const enrolls= await paginate(query,this.enrollRepo,{
      sortableColumns: ['createdAt','updatedAt','status'],
      searchableColumns: ['course.title','status','course.instructor.name'],
      filterableColumns: {
        status: [FilterOperator.IN],
      },
      defaultLimit: 10,
      maxLimit: 100,
      defaultSortBy: [['createdAt','DESC']],
      relations: ['course','course.instructor'],
      where: {userId: user.id}
    })
    const dataDto= plainToInstance(EnrollResponseDto,enrolls.data,{excludeExtraneousValues: true})

    return {
      ...enrolls,
      data: dataDto
    } 
  }

  async findOne(id: string,user: UserData): Promise<EnrollResponseDto>  {
   const enroll= await this.enrollRepo.findOneOrFail({where: {id,userId: user.id},relations: ['course']})
   return plainToInstance(EnrollResponseDto,enroll, {excludeExtraneousValues: true})
  }

  update(id: number, updateEnrollmentDto) {
    return `This action updates a #${id} enrollment`;
  }

  remove(id: number) {
    return `This action removes a #${id} enrollment`;
  }
}
