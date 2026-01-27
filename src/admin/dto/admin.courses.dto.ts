import { IsBoolean, IsOptional } from "class-validator";



export class CoursePublishDto {
    @IsBoolean()
    isPublished: boolean
    
    @IsOptional()
    @IsBoolean()
    isFree: boolean
}