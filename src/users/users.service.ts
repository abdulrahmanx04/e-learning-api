import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData } from 'src/common/all-interfaces/all-interfaces';
import { ProfileResponseDto, UpdateProfileDto } from './dto/profile-dto';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendEmail } from 'src/common/utils/email';
import { PasswordDto } from 'src/auth/dto/auth-dto';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users }from '../auth/entities/auth.entity'
import { plainToInstance } from 'class-transformer';
@Injectable()
export class UsersService {
    constructor(@InjectRepository(Users) private userRepo:  Repository<Users>,
    private cloudinaryService: CloudinaryService
) {}

    async findOne(userData: UserData): Promise<ProfileResponseDto> {
        const user= await this.userRepo.findOneOrFail({
            where: {
                id: userData.id
            },
        })
        return plainToInstance(ProfileResponseDto,user,{excludeExtraneousValues: true})
    }

    async updateOne(dto: UpdateProfileDto, userData: UserData, file?: Express.Multer.File)
    
    {
        const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
        
        await this.uploadProfilePic(user,file)
        
        await this.updateEmail(user,dto)
        
        Object.keys(dto).forEach((key) => {
            if(key !== 'email' && dto[key] !== undefined) {
                user[key]= dto[key]
            }
        })
        
        await this.userRepo.save(user)

        return {
           ...plainToInstance(ProfileResponseDto,user, {excludeExtraneousValues: true}),
           message: dto.email ? 'Email verification sent'  : 'Profile updated successfully'
        }
        
    }

    async deleteOne(dto: PasswordDto,userData: UserData) {

        const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
      
        const isValid= await bcrypt.compare(dto.password,user.password)
        if(!isValid) {
            throw new BadRequestException('Incrorrect password')
        }

        if(user.avatarPublicId) {
            await this.cloudinaryService.deleteFile(user.avatarPublicId,'image')
        }
        await this.userRepo.delete({id: userData.id})

        return
    }

    private async uploadProfilePic(user: Users, file?: Express.Multer.File) {
        if(!file) return
        const avatar= await this.cloudinaryService.uploadFile(file,'avatar') as UploadApiResponse
        user.avatar= avatar.secure_url,
        user.avatarPublicId= avatar.public_id
    }

    private async updateEmail(user: Users, dto: UpdateProfileDto) {
        if(!dto.email) return 
        const exists= await this.userRepo.findOneBy({email: dto.email})
        if(exists && exists.id !== user.id) {
            throw new BadRequestException('Email already used')
        }
        const token= crypto.randomBytes(32).toString('hex')
        const hashedToken= crypto.createHash('sha256').update(token).digest('hex')
        const url= `${process.env.FRONTEND_URL}/auth/verify-email/${token}`
        user.verificationToken=hashedToken
        user.verificationTokenExpiry= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        user.pendingEmail= dto.email
        await sendEmail('verification',dto.email,url)
    }

}