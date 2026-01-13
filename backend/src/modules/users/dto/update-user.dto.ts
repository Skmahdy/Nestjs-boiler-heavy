import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'newemail@example.com', description: 'New email address' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'Jane Smith', description: 'Updated name' })
    @IsString()
    @IsOptional()
    name?: string;
}
