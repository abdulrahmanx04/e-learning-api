import { Expose } from "class-transformer";
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class UpdateProfileDto {

    @IsOptional()
    @IsEmail()
    email?: string


    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    name?: string

}

export class ProfileResponseDto {
    @Expose() 
    id: string

    @Expose()    
    name: string

    @Expose()
    email: string

    @Expose()
    role: string

    @Expose()
    isActive: string

    @Expose()
    avatar: string
}