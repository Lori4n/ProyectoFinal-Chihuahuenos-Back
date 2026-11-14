import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.userRepository.save([
        {
          fullName: 'ChihuaAdmin',
          email: 'admin@chihuahuenos.com',
          password: hashedPassword,
          role: UserRole.ADMIN,
          isVerified: true,
        },
        {
          fullName: 'Cliente Prueba',
          email: 'cliente@gmail.com',
          password: hashedPassword,
          role: UserRole.CLIENT,
          isVerified: false,
        },
      ]);
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const email = registerUserDto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOneBy({ email });

    if (existing) {
      throw new ConflictException('Ya existe una cuenta registrada con ese correo');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = this.userRepository.create({
      fullName: registerUserDto.fullName.trim(),
      email,
      password: hashedPassword,
      role: registerUserDto.role ?? UserRole.CLIENT,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token: this.jwtService.sign({ userId: savedUser.userId, role: savedUser.role }),
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const email = loginUserDto.email.toLowerCase().trim();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token: this.jwtService.sign({ userId: user.userId, role: user.role }),
    };
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    return user;
  }
}