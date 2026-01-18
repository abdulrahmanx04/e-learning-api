import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { LessonType } from "../entities/lesson.entity";
import { Expose, Transform, Type } from "class-transformer";


export class CreateLessonDto {
    @IsNotEmpty()
    @IsString()
    @Length(3,50)
    title: string

    @IsOptional()
    @IsString()
    @Length(10,500)
    description?: string

    @IsOptional()
    @IsString()
    @Length(50,10000)
    content?: string


    @IsOptional()
    @IsEnum(LessonType)
    lessonType?: LessonType


    @IsOptional()
    @IsInt()
    order?: number 

    @IsOptional()
    @IsInt()
    duration?: number 

    @IsOptional()
    @IsInt()
    completionCount?: number 

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value == 'true' || value == true)
    isPublished?: boolean

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value == 'true' || value == true)
    isFree?: boolean

}
export class UpdateLessonDto {
    @IsOptional()
    @IsString()
    @Length(3,50)
    title: string

    @IsOptional()
    @IsString()
    @Length(10,500)
    description?: string

    @IsOptional()
    @IsString()
    @Length(50,10000)
    content?: string


    @IsOptional()
    @IsEnum(LessonType)
    lessonType?: LessonType


    @IsOptional()
    @Transform(({value}) => Number(value))
    @IsInt()
    order?: number 

    @IsOptional()
    @Transform(({value}) => Number(value))
    @IsInt()
    duration?: number 

    @IsOptional()
    @Transform(({value}) => Number(value))
    @IsInt()
    completionCount?: number 

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value == 'true' || value == true)
    isPublished?: boolean

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => value == 'true' || value == true)
    isFree?: boolean
}

export class FileDto {
    @Expose()
    url: string

    @Expose()
    fileName: string

    @Expose()
    publicId: string
 
    @Expose()
    size: number
}
export class LessonResponseDto {
    @Expose()
    id: string

    @Expose()
    title: string;

    @Expose()
    description: string;

    @Expose()
    content: string;

    @Expose()
    lessonType: LessonType
    
    @Expose()
    order: number;
    
    @Expose()
    duration: number;
  
    @Expose()
    isFree: boolean;

    @Expose()
    isPublished: boolean;

    @Expose()
    @Type(() => FileDto)
    videos: FileDto[]

    @Expose()
    @Type(() => FileDto)
    materials: FileDto[]
}


export class LessonRolesResponseDto extends LessonResponseDto {
    @Expose()
    courseId: string;

    @Expose()
    createdAt: Date;

    @Expose()
    updatedAt: Date;
}