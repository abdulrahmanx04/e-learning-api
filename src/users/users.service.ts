import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserData, UserProfileResponse } from 'src/common/all-interfaces/all-interfaces';
import { UpdateProfileDto } from './dto/profile-dto';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendEmail } from 'src/common/utils/email';
import { PasswordDto } from 'src/auth/dto/auth-dto';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users }from '../auth/entities/auth.entity'
@Injectable()
export class UsersService {
    constructor(@InjectRepository(Users) private userRepo:  Repository<Users>,
    private cloudinaryService: CloudinaryService
) {}

    async findOne(userData: UserData): Promise<UserProfileResponse> {
        const user= await this.userRepo.findOneOrFail({
            where: {
                id: userData.id
            },
            relations: ['courses']
        })
        
        return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                avatar: user.avatar,
                courses: user.courses
           }
    }

    async updateOne(dto: UpdateProfileDto, userData: UserData, file?: Express.Multer.File)
    : Promise<UserProfileResponse>
    {
        const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
        if(!dto.email && !dto.name && !file) {
            throw new BadRequestException('Nothing to update')
        }
        
        if(file) {
            try {
                let avatar= await this.cloudinaryService.uploadFile(file,'avatar') as UploadApiResponse
                user.avatar= avatar.secure_url
                user.avatarPublicId= avatar.public_id
            }catch(err){
                throw new NotFoundException('Error uploading')
            }
        }  
        if(dto.email) {
            const exists= await this.userRepo.findOneBy({email: dto.email})
            if(exists) {
                throw new BadRequestException('Email already used')
            }
            const token= crypto.randomBytes(32).toString('hex')
            const hashedToken= crypto.createHash('sha256').update(token).digest('hex')
            const url= `${process.env.FRONTEND_URL}/auth/verify-email/${token}`
            user.verificationToken=token
            user.verificationTokenExpiry= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            await sendEmail('verification',dto.email,url)
        }
        
        Object.keys(dto).forEach((key) => {
            if(key !== 'email' && dto[key] !== undefined) {
                user[key]= dto[key]
            }
        })
        
        await this.userRepo.save(user)

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            avatar: user.avatar,
        }
    }

    async deleteOne(dto: PasswordDto,userData: UserData) {

        const user= await this.userRepo.findOneOrFail({where: {id: userData.id}})
      
        const isValid= await bcrypt.compare(dto.password,user.password)
        if(!isValid) {
            throw new BadRequestException('Incrorrect password')
        }

        if(user.avatarPublicId) {
            await this.cloudinaryService.deleteFile(user.avatarPublicId)
        }
        await this.userRepo.delete({id: userData.id})

        return
    }

}