import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('admin')
    @HttpCode(HttpStatus.CREATED)
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create user with role assignment (Admin only)' })
    @ApiResponse({ status: 201, description: 'Admin user successfully created' })
    @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
    createAdmin(@Body() createUserAdminDto: CreateUserAdminDto) {
        return this.usersService.createAdmin(createUserAdminDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.MODERATOR)
    @ApiOperation({ summary: 'Get all users with pagination (Admin/Moderator only)' })
    @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - requires admin or moderator role' })
    findAll(@Query() pagination: PaginationDto) {
        return this.usersService.findAll(pagination.page, pagination.limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - can only view own profile' })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id') id: string, @Request() req) {
        // Users can view their own profile, admins can view any profile
        if (req.user.id !== id && req.user.role !== Role.ADMIN) {
            throw new ForbiddenException('You can only view your own profile');
        }
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user profile' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - can only update own profile' })
    @ApiResponse({ status: 404, description: 'User not found' })
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ) {
        // Users can only update their own profile
        if (req.user.id !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }
        return this.usersService.update(id, updateUserDto);
    }

    @Patch(':id/password')
    @ApiOperation({ summary: 'Update user password' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Password updated successfully' })
    @ApiResponse({ status: 400, description: 'Bad request - current password incorrect' })
    @ApiResponse({ status: 403, description: 'Forbidden - can only update own password' })
    updatePassword(
        @Param('id') id: string,
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Request() req
    ) {
        // Users can only update their own password
        if (req.user.id !== id) {
            throw new ForbiddenException('You can only update your own password');
        }
        return this.usersService.updatePassword(id, updatePasswordDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user account' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - can only delete own account' })
    @ApiResponse({ status: 404, description: 'User not found' })
    remove(@Param('id') id: string, @Request() req) {
        // Users can delete their own account, admins can delete any account
        if (req.user.id !== id && req.user.role !== Role.ADMIN) {
            throw new ForbiddenException('You can only delete your own account');
        }
        return this.usersService.remove(id);
    }
}
