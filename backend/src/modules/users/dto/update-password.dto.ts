import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
    @ApiProperty({ example: 'currentPassword123', description: 'Current password for verification' })
    @IsString()
    currentPassword: string;

    @ApiProperty({ example: 'newPassword456', minLength: 8, description: 'New password' })
    @IsString()
    @MinLength(8)
    newPassword: string;
}
