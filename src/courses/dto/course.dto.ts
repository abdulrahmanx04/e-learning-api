import { Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { Column } from "typeorm";
import { CourseCategory, CourseLevels } from "../entities/course.entity";


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
    isPublished?: boolean

    @IsNotEmpty()
    @IsUUID()
    userId: string
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
    isPublished?: boolean

}

