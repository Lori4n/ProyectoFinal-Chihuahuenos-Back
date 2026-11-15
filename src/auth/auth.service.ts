import 'multer';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { extname } from 'path';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-2';
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || 'osco-project-test';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async onModuleInit() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.userRepository.save([
        {
          fullName: 'Administrador Chihuahueños',
          email: 'admin@chihuahuenos.com',
          password: hashedPassword,
          role: UserRole.ADMIN,
          isVerified: true,
        },
        {
          fullName: 'Cliente Prueba',
          email: 'cliente@chihuahuenos.com',
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
      throw new ConflictException('Ya existe una cuenta registrada con este correo');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = this.userRepository.create({
      fullName: registerUserDto.fullName.trim(),
      email,
      password: hashedPassword,
      role: UserRole.CLIENT,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      token: this.jwtService.sign({ userId: savedUser.userId, role: savedUser.role }),
    };
  }

  async registerAdmin(registerUserDto: RegisterUserDto) {
    const email = registerUserDto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOneBy({ email });

    if (existing) {
      throw new ConflictException('Ya existe una cuenta registrada con este correo');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    const user = this.userRepository.create({
      fullName: registerUserDto.fullName.trim(),
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      isVerified: true,
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

  async verifyIdentity(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOneBy({ userId });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (user.isVerified || user.idDocumentUrl) {
      throw new ConflictException(
        'La identidad de este usuario ya fue verificada anteriormente',
      );
    }

    const fileExtension = extname(file.originalname);
    const key = `chihuahuenos/identities/${userId}-${Date.now()}${fileExtension}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('Error al subir el documento de identidad');
    }

    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    user.isVerified = true;
    user.idDocumentUrl = fileUrl;

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'Identidad verificada correctamente',
      user: updatedUser,
    };
  }
}