import { Exclude } from 'class-transformer';
import { Role } from '@prisma/client';

export class UserEntity {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    createdAt: Date;
    updatedAt: Date;

    @Exclude()
    password: string;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
