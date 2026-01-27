import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { FilterOperator, paginate, PaginateQuery } from "nestjs-paginate";
import { Enrollments, EnrollStatus } from "src/enrollment/entities/enrollment.entity";
import { Repository } from "typeorm";
import { AdminEnrollmentDto, EnrollStatusDto } from "../dto/admin.enrollments.dto";





export class AdminEnrollmentsService{
    constructor(@InjectRepository(Enrollments) private enrollRepo: Repository<Enrollments>){}

    async findAll(query: PaginateQuery){
        const enrollments= await paginate(query,this.enrollRepo, {
            sortableColumns: ['createdAt','updatedAt','lastAccessedAt','completedAt'],
            searchableColumns: ['user.name','user.email'],
            filterableColumns: {
                'user.name': [FilterOperator.ILIKE],
                status: [FilterOperator.IN]
            },
            defaultSortBy: [['createdAt','DESC']],
            maxLimit: 100,
            defaultLimit: 10,
            relations: ['course','user']
        })

        const dataDto= plainToInstance(AdminEnrollmentDto,enrollments.data,{excludeExtraneousValues: true})
        return {
            ...enrollments,
            data: dataDto
        }
    }

    async updateEnrollStatus(id: string,dto: EnrollStatusDto) {
        const enrollment= await this.enrollRepo.findOneOrFail({where: {id}})
        enrollment.status= dto.status
        enrollment.lastAccessedAt= new Date()
        await this.enrollRepo.save(enrollment)
        return  plainToInstance(AdminEnrollmentDto,enrollment,{excludeExtraneousValues: true})
    }

    async getEnrollStats() {
        const [total,pending,active,dropped,completed]= await Promise.all([
            this.enrollRepo.count(),
            this.enrollRepo.count({where: {status: EnrollStatus.PENDING}}),
            this.enrollRepo.count({where: {status: EnrollStatus.ACTIVE}}),
            this.enrollRepo.count({where: {status: EnrollStatus.DROPPED}}),
            this.enrollRepo.count({where: {status: EnrollStatus.COMPLETED}})
        ])
        return {
            total,
            pending,
            active,
            dropped,
            completed
        }
    }
}