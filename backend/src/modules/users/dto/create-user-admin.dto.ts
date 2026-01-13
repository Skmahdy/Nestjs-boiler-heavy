import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';
import { CreateUserDto } from './create-user.dto';

export class CreateUserAdminDto extends CreateUserDto {
    @IsEnum(Role)
    @IsOptional()
    role?: Role;
}
