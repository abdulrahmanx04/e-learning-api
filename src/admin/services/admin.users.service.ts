import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAdminDto, AdminUsersResponseDto } from '../dto/admin.users.dto';
import { UpdateAdminRoleDto, UpdateAdminUserBan } from '../dto/admin.users.dto';
import { FilterOperator, paginate, PaginateQuery } from 'nestjs-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, Users } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { ProfileResponseDto } from 'src/users/dto/profile-dto';
import { UserData } from 'src/common/all-interfaces/all-interfaces';

@Injectable()
export class AdminUserService {
  constructor(@InjectRepository(Users) private userRepo: Repository<Users>){}
  create(createAdminDto: CreateAdminDto) {
    return 'This action adds a new admin';
  }

  async findAll(query: PaginateQuery) {
     const users= await paginate(query,this.userRepo, {
      sortableColumns: ['createdAt','updatedAt','role','isActive'],
      searchableColumns: ['name','email'],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
        email: [FilterOperator.ILIKE],
        role: [FilterOperator.IN],
        isActive: [FilterOperator.EQ],
      },
      defaultLimit: 10,
      maxLimit: 10,
      defaultSortBy: [['createdAt', 'DESC']],
     })
     const dataDto= plainToInstance( AdminUsersResponseDto,users.data, {excludeExtraneousValues: true})
     return {
      ...users,
      data: dataDto
     }
  }

  async findOne(id: string) {
    const user= await this.userRepo.findOneOrFail({where: {id}})
     return plainToInstance( AdminUsersResponseDto,user, {excludeExtraneousValues: true})
  }

 async getUserStats() {
  const [total,
    active,
    banned,
    students,
   instructors,
    admins
  ]= 
  await Promise.all([
     this.userRepo.count(),
     this.userRepo.count({ where: { isActive: true } }),
     this.userRepo.count({ where: { isBanned: true } }),
     this.userRepo.count({ where: { role: Role.STUDENT } }),
     this.userRepo.count({ where: { role:  Role.INSTRUCTOR } }),
     this.userRepo.count({ where: { role: Role.ADMIN } })
  ])
  return {
    total,
    active,
    banned,
    students,
    instructors,
    admins,
  }
 
}

  async updateRole(id: string, updateAdminDto: UpdateAdminRoleDto, admin: UserData) {
    const user= await this.userRepo.findOneOrFail({where: {id}})
    if(admin.id === user.id && updateAdminDto.role !== 'admin') {
      throw new BadRequestException('You cannot remove your own admin role')
    }
    user.role = updateAdminDto.role
    await this.userRepo.save(user)
    return plainToInstance( AdminUsersResponseDto,user, {excludeExtraneousValues: true})
  }

  async updateUserBan(id: string,updateUserBan: UpdateAdminUserBan, admin: UserData) {
      const user= await this.userRepo.findOneOrFail({where: {id}}) 

      this.userBan(user,updateUserBan,admin)

      await this.userRepo.save(user)

      return plainToInstance(AdminUsersResponseDto,user, {excludeExtraneousValues: true})
  }

 
  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

   private userBan(user : Users, updateUserBan: UpdateAdminUserBan, admin: UserData) {
      if (admin.id === user.id && updateUserBan.isBanned === true) {
         throw new BadRequestException('You cannot ban yourself');
      }
      if(updateUserBan.isBanned) {
          user.isBanned= updateUserBan.isBanned
          user.isActive= false,
          user.bannedAt= new Date()
      }else {
        user.isBanned= updateUserBan.isBanned
      }
  }

}
