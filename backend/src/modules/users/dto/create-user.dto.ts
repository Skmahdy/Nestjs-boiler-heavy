import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 8, description: 'User password' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: 'John Doe', description: 'User full name' })
    @IsString()
    @IsOptional()
    name?: string;
}
