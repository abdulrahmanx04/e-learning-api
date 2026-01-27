import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/role.decorator";
import { JwtAuthGuard } from "src/common/guards/AuthGuard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { AdminEnrollmentsService } from "../services/admin.enrollments.service";
import { Paginate} from "nestjs-paginate";
import type{ PaginateQuery } from "nestjs-paginate";
import { EnrollStatusDto } from "../dto/admin.enrollments.dto";



@Controller('admin/enrollments')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('admin')
export class AdminEnrollmentsController {
    constructor(private adminEnrollService: AdminEnrollmentsService) {}
    @Get('')
    findAll(@Paginate() query: PaginateQuery){
        return this.adminEnrollService.findAll(query)
    }

    @Patch('/:id')
    updateEnrollStatus(@Param('id') id: string, @Body() dto: EnrollStatusDto) {
        return this.adminEnrollService.updateEnrollStatus(id,dto)
    }

    @Get('/stats')
    getEnrollStats(){
        return this.adminEnrollService.getEnrollStats()
    }
}