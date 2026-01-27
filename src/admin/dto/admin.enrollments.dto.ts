import { Expose, Type } from "class-transformer";
import { IsEnum } from "class-validator";
import { EnrollResponseDto } from "src/enrollment/dto/enrollment.dto";
import { EnrollStatus } from "src/enrollment/entities/enrollment.entity";




export class UserDto {
    @Expose()
    name: string

    @Expose()
    email: string

    @Expose()
    avatar: string
}


export class AdminEnrollmentDto extends EnrollResponseDto {
    @Expose()
    @Type(() => UserDto)
    user: UserDto
    @Expose()
    lastAccessedAt: Date
    @Expose()
    updatedAt: Date
}

export class EnrollStatusDto {
    @IsEnum(EnrollStatus)
    status: EnrollStatus
}