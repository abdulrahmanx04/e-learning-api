import { BadRequestException, Injectable, NotFoundException,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loginDto, RegisterDto, EmailDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth-dto';
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { sendEmail } from 'src/common/utils/email';
import { UserData } from '../common/all-interfaces/all-interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/auth.entity';
import {  Repository, MoreThan, LessThan } from 'typeorm';
import {Role} from './entities/auth.entity'

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Users) private userRepo: Repository<Users>
    ) {}

   
    async register(dto: RegisterDto): Promise<{message: string}> {
        const existingUser= await this.userRepo.findOne({
          where: {
            email: dto.email
          }
        })

        const{token,hashedToken,url}= this.generateEmailVerification()

        const newUser= this.registerUser(dto,hashedToken)

        await  Promise.all([
          this.userRepo.save(newUser),
           sendEmail('verification',newUser.email,url)
        ])

        return {
          message: 'User created successfully, please verify your email to login'
        }
    }

    async verifyEmail(verificationToken: string): Promise<{token: string}> {
        const hashedToken= crypto.createHash('sha256').update(verificationToken).digest('hex')
        const userExists= await this.userRepo.findOneOrFail({
            where: {
                verificationToken: hashedToken,
                verificationTokenExpiry: MoreThan(new Date())
            }
        })

        if (userExists.pendingEmail) {
            await this.verifyNewEmail(userExists)
        }

        userExists.isActive= true
        userExists.verificationToken=null
        userExists.verificationTokenExpiry=null
        const token= this.generateToken({id: userExists.id,role: userExists.role,email: userExists.email})

        await this.userRepo.save(userExists)

        return {
            token
        }
    }

    async resendVerification(dto: EmailDto): Promise<{message: string}> {
        const userExists= await this.userRepo.findOneOrFail({
            where: {
               email: dto.email,
               isActive: false
            }
        })

        const{token,hashedToken,url}= this.generateEmailVerification()

        userExists.verificationToken=hashedToken
        userExists.verificationTokenExpiry= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await  Promise.all([
          this.userRepo.save(userExists),
           sendEmail('verification',userExists.email,url)
        ])
        return {
            message: 'Email resent successfully'
        }
    }

    async login(dto: loginDto): Promise<{token: string}> {
        const userExists= await this.userRepo.findOneOrFail({where: {email: dto.email}})

        // if(!exists.isActive) {
        //     throw new BadRequestException('Email verification required')
        // }
        const isValid= await bcrypt.compare(dto.password,userExists.password)

        if(!isValid) {
            throw new BadRequestException('Invalid credentials')
        }

        const token= this.generateToken({id: userExists.id,role: userExists.role,email:userExists.email})
        return {
            token
        }
    }

    async forgotPassword(dto: EmailDto): Promise<{message: string}> {
        const user= await this.userRepo.findOneOrFail({where: {email: dto.email}})

       const{token,hashedToken,url}= this.generateEmailVerification()

        user.resetPasswordToken=hashedToken
        user.resetPasswordExpiry=new Date(Date.now() + 15 * 60 * 1000)

        await this.userRepo.save(user)


       await sendEmail('resetPassword',user.email,url)
        return {
            message: 'If the email exists, a reset password link has been sent.'
        }
    }

    async resetPassword(token: string,dto: ResetPasswordDto): Promise<{token: string}> {
        const hashToken= crypto.createHash('sha256').update(token).digest('hex')
        const user= await this.userRepo.findOneOrFail({
            where: {
                resetPasswordToken: hashToken,
                resetPasswordExpiry: MoreThan(new Date())
            }
        })

        user.password= dto.password
        user.resetPasswordToken= null
        user.resetPasswordExpiry= null

        await this.userRepo.save(user)

        const newToken= this.generateToken({id: user.id, role: user.role})
        return {
            token: newToken
        }
    }

    async changePassword(dto: ChangePasswordDto, userData: UserData) {

        const user= await this.userRepo.findOneBy({id: userData.id})
        if(!user) {
            throw new BadRequestException('User not found')
        }
        if(dto.currentPassword === dto.newPassword) {
            throw new BadRequestException('Current and new password cannot be the same')
        }
        const isValid= await bcrypt.compare(dto.currentPassword,user.password)
        if(!isValid) {
            throw new BadRequestException('Current password is incorrect')
        }

        user.password= dto.newPassword

        await this.userRepo.save(user)

        return
    }

     private generateToken({id, role,email}: Record<string,string>): string {
        return  this.jwtService.sign({id,role,email})
    }

    private generateEmailVerification() {
        const token = crypto.randomBytes(32).toString('hex') as string
        const hashedToken= crypto.createHash('sha256').update(token).digest('hex') as string
        const url= `${process.env.FRONTEND_URL}/auth/verify-email/${token}` as string
        return {token,hashedToken,url}
    }

   private registerUser(dto: RegisterDto,hashedToken: string) {
        return this.userRepo.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            role: Role.STUDENT,
            verificationToken: hashedToken,
            verificationTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
   }
   private async verifyNewEmail(userExists: Users) {
        if(userExists.pendingEmail) {
            const taken= await this.userRepo.findOneBy({email : userExists.pendingEmail})
            if(taken && taken.id !== userExists.id) {
                throw new BadRequestException('Email already used')
            }
            userExists.email= userExists.pendingEmail
            userExists.pendingEmail= null
     }
   }
}