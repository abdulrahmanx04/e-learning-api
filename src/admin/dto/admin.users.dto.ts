import { Expose } from "class-transformer";
import { ProfileResponseDto } from "src/users/dto/profile-dto";
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/auth/entities/auth.entity';

export class CreateAdminDto {}
export class AdminUsersResponseDto extends ProfileResponseDto {
    @Expose()
    isBanned: boolean
}


export class UpdateAdminRoleDto  {
    @IsEnum(Role)
    role: Role
}


export class UpdateAdminUserBan {
    @IsBoolean()
    isBanned: boolean
}
