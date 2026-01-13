import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

// Type for User without password
export type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersRepository {
    constructor(private prisma: PrismaService) { }

    // Default select excluding password
    private readonly selectWithoutPassword = {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        password: false,
    };

    async create(data: Prisma.UserCreateInput): Promise<UserWithoutPassword> {
        return this.prisma.user.create({
            data,
            select: this.selectWithoutPassword,
        });
    }

    // Overloaded signatures for findOne
    async findOne(where: Prisma.UserWhereUniqueInput, includePassword: true): Promise<User | null>;
    async findOne(where: Prisma.UserWhereUniqueInput, includePassword?: false): Promise<UserWithoutPassword | null>;
    async findOne(
        where: Prisma.UserWhereUniqueInput,
        includePassword: boolean = false
    ): Promise<User | UserWithoutPassword | null> {
        if (includePassword) {
            return this.prisma.user.findUnique({ where });
        }
        return this.prisma.user.findUnique({
            where,
            select: this.selectWithoutPassword,
        });
    }

    async findMany(params: {
        skip?: number;
        take?: number;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<UserWithoutPassword[]> {
        const { skip, take, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            where,
            orderBy,
            select: this.selectWithoutPassword,
        });
    }

    async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<UserWithoutPassword> {
        const { where, data } = params;
        return this.prisma.user.update({
            where,
            data,
            select: this.selectWithoutPassword,
        });
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<UserWithoutPassword> {
        return this.prisma.user.delete({
            where,
            select: this.selectWithoutPassword,
        });
    }

    async count(where?: Prisma.UserWhereInput): Promise<number> {
        return this.prisma.user.count({ where });
    }

    // Method to find by email with password (for authentication)
    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
}
