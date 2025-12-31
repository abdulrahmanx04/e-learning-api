import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/common/guards/jwt-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({secret: process.env.JWT, signOptions: {expiresIn: '7d'}}),
    PassportModule.register({defaultStrategy: 'jwt'})
  ],

  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],
})
export class AuthModule {}
