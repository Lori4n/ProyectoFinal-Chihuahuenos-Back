import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('register-admin')
  @UseGuards(AdminGuard)
  registerAdmin(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerAdmin(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('profile/:userId')
  getProfile(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.authService.findOne(userId);
  }
}