import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { AppConfig } from '../../../config/configuration';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UsersService } from '../../users/services/users.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';
import type {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(
      { id: user.id, email: user.email, role: user.role },
      new UserResponseDto(user),
    );
  }

  private buildAuthResponse(
    user: AuthenticatedUser,
    userDto: UserResponseDto,
  ): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret', { infer: true }),
      expiresIn: this.configService.get('jwt.expiresIn', { infer: true }),
    });

    return new AuthResponseDto(accessToken, userDto);
  }
}
