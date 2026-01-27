import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminUserService } from '../services/admin.users.service';
import { CreateAdminDto } from '../dto/admin.users.dto';
import { UpdateAdminRoleDto, UpdateAdminUserBan } from '../dto/admin.users.dto';
import { Paginate} from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { JwtAuthGuard } from 'src/common/guards/AuthGuard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { CurrentUser } from 'src/common/decorators/current-user';
import type { UserData } from 'src/common/all-interfaces/all-interfaces';

@Controller('admin/users')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
export class AdminUserController {
  constructor(private readonly adminService: AdminUserService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get('stats')
  usersStats() {
    return this.adminService.getUserStats()
  }
  
  @Get('')
  findAll(@Paginate() query: PaginateQuery) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }
 

  @Patch('/:id/role')
  updateRole(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminRoleDto,@CurrentUser() admin: UserData) {
    return this.adminService.updateRole(id, updateAdminDto, admin);
  }

  @Patch('/:id/ban')
  updateUserBan(@Param('id') id: string, @Body() updateUserBan: UpdateAdminUserBan,@CurrentUser() admin: UserData) {
    return this.adminService.updateUserBan(id, updateUserBan,admin);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
