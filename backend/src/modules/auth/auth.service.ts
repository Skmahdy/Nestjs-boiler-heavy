import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user,
            access_token: token,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.validateUser(
            loginDto.email,
            loginDto.password
        );

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user,
            access_token: token,
        };
    }

    private generateToken(userId: string, email: string, role: string): string {
        const payload = { sub: userId, email, role };
        return this.jwtService.sign(payload);
    }

    async validateToken(userId: string) {
        return this.usersService.findOne(userId);
    }
}
