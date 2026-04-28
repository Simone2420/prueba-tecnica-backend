import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  private generateReference(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN-${date}-${randomStr}`;
  }

  async create(merchantId: string, createDto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        merchant_id: merchantId,
        amount: createDto.amount,
        currency: createDto.currency,
        type: createDto.type,
        status: 'pending',
        reference: this.generateReference(),
        metadata: createDto.metadata,
      },
    });
  }

  async findAll(merchantId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { merchant_id: merchantId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.transaction.count({ where: { merchant_id: merchantId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, merchantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, merchant_id: merchantId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(id: string, merchantId: string, updateDto: UpdateTransactionStatusDto) {
    const transaction = await this.findOne(id, merchantId);

    // State machine validation
    const validTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected', 'failed'],
      approved: ['completed'],
      rejected: [],
      failed: [],
      completed: [],
    };

    if (!validTransitions[transaction.status].includes(updateDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${transaction.status} to ${updateDto.status}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: updateDto.status },
    });
  }
}
