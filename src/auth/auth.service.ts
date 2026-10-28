import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Реєстрація нового користувача
  async register(dto: { email: string; password: string; displayName?: string }) {
    // 1. Перевіряємо, чи існує користувач із таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Користувач із таким email вже існує');
    }

    // 2. Хешуємо пароль
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Створюємо користувача та його профіль в одній транзакції
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        profile: {
          create: {
            displayName: dto.displayName || 'Кухар',
          },
        },
      },
      include: { profile: true },
    });

    // 4. Повертаємо дані без пароля
    const { password, ...result } = user;
    return {
      message: 'Користувач успішно зареєстрований',
      user: result,
    };
  }

  // Авторизація (Логін)
  async login(dto: { email: string; password: string }) {
    // 1. Шукаємо користувача
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    // 2. Порівнюємо паролі
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    // 3. Генеруємо JWT-токен
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Успішний вхід',
      accessToken,
    };
  }
}