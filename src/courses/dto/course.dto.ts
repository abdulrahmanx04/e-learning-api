import { Injectable } from "@nestjs/common";
import { Expose, Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { CourseCategory, CourseLevels } from "../entities/course.entity";
import { FileDto } from "src/lessons/dto/lesson.dto";


@Injectable()
export class CreateCourseDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,30)
    title: string


    @IsNotEmpty()
    @IsString()
    @Length(10,100)
    description: string

    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    price: number

    @IsOptional()
    @IsEnum(CourseCategory)
    category?: CourseCategory

    @IsOptional()
    @IsEnum(CourseLevels)
    level?: CourseLevels

  
    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number


    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value === 'true')
    isPublished?: boolean

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value === 'true')
    isFree?: boolean

}


export class UpdateCourseDto {
    @IsOptional()
    @IsString()
    @Length(3,30)
    title?: string

    @IsOptional()
    @IsString()
    @Length(10,100)
    description?: string

    @IsOptional()
    @Min(1)
    @Type(() => Number)
    price?: number

    @IsOptional()
    @IsEnum(CourseCategory)
    category?: CourseCategory

    @IsOptional()
    @IsEnum(CourseLevels)
    level?: CourseLevels

  
    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value == 'true')
    isPublished?: boolean

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value === 'true')
    isFree?: boolean


}


export class CourseResponseDto {
    @Expose()
    id: string

    @Expose()
    title: string

    @Expose()
    description: string

    @Expose()
    category: CourseCategory

    @Expose()
    level?: CourseLevels

    @Expose()
    duration?: number

    @Expose()
    rating: number

    @Expose()
    price: number
    
    @Expose()
    isFree: boolean

    @Expose()
    isPublished?: boolean

    @Expose()
    thumbnailUrl: string

    @Expose()
    thumbnailPublicId: string

    @Expose()
    @Transform(({ obj }) => obj.teacher?.name)
    teacherName: string;

    @Expose()
    @Transform(({ obj }) => obj.teacher?.avatar)
    teacherAvatar: string;

}


export class RolesResponseCourseDto extends CourseResponseDto {

    @Expose()
    @Type(() => FileDto)
    materials: FileDto[]

    @Expose()
    enrollmentCount: number

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
}
