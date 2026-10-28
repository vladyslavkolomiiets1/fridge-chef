import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
  };
}

@Controller('products')
@UseGuards(JwtAuthGuard) // Захищаємо весь контролер: доступ лише з токеном
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Req() req: RequestWithUser) {
    const userId = req.user.sub; // Беремо ID користувача з JWT-токена
    return this.productsService.findAll(userId);
  }

  @Post()
  async create(@Req() req: RequestWithUser, @Body() dto: any) {
    const userId = req.user.sub;
    return this.productsService.create(userId, dto);
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.productsService.remove(userId, id);
  }
}