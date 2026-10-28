import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateProductDto {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string; // Формат дати (ISO string)
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Отримати всі продукти конкретного користувача
  async findAll(userId: string) {
    return this.prisma.product.findMany({
      where: { userId },
      orderBy: { expirationDate: 'asc' }, // Найближчі терміни придатності зверху
    });
  }

  // Додати новий продукт у холодильник
  async create(userId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit,
        expirationDate: new Date(dto.expirationDate),
        userId,
      },
    });
  }

  // Видалити продукт за ID (з перевіркою чи він належить користувачу)
  async remove(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.userId !== userId) {
      throw new NotFoundException('Продукт не знайдено або у вас немає доступу');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}