import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.usersRepository.findOne({
            email: createUserDto.email,
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = await this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        this.logger.info('User created', { userId: user.id, email: user.email });
        return user;
    }

    async createAdmin(createUserAdminDto: CreateUserAdminDto) {
        const existingUser = await this.usersRepository.findOne({
            email: createUserAdminDto.email,
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserAdminDto.password, 10);

        const user = await this.usersRepository.create({
            ...createUserAdminDto,
            password: hashedPassword,
        });

        this.logger.info('Admin user created', { userId: user.id, email: user.email, role: user.role });
        return user;
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.usersRepository.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.usersRepository.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.usersRepository.findOne({ id });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id); // Check if exists

        // Check if email is being changed and if it's already taken
        if (updateUserDto.email) {
            const existingUser = await this.usersRepository.findOne({
                email: updateUserDto.email,
            });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        const user = await this.usersRepository.update({
            where: { id },
            data: updateUserDto,
        });

        this.logger.info('User updated', { userId: id });
        return user;
    }

    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
        const user = await this.usersRepository.findOne({ id }, true);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(
            updatePasswordDto.currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

        const updatedUser = await this.usersRepository.update({
            where: { id },
            data: { password: hashedPassword },
        });

        this.logger.info('User password updated', { userId: id });
        return updatedUser;
    }

    async remove(id: string) {
        await this.findOne(id);
        const user = await this.usersRepository.delete({ id });
        this.logger.info('User deleted', { userId: id });
        return user;
    }

    // Method for authentication (returns user with password)
    async validateUser(email: string, password: string) {
        const user = await this.usersRepository.findByEmailWithPassword(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        // Return user without password
        const { password: _, ...result } = user;
        return result;
    }
}
