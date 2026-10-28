import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback_secret_key',
      signOptions: { expiresIn: '1d' }, // Токен діє 1 день
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}