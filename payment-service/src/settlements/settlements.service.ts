import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  async create(merchantId: string, createDto: CreateSettlementDto) {
    const periodStart = new Date(createDto.period_start);
    const periodEnd = new Date(createDto.period_end);

    if (periodStart > periodEnd) {
      throw new BadRequestException('period_start must be before period_end');
    }

    // Find eligible transactions (completed, within period, not already settled)
    const transactions = await this.prisma.transaction.findMany({
      where: {
        merchant_id: merchantId,
        status: 'completed',
        created_at: {
          gte: periodStart,
          lte: periodEnd,
        },
        settlementTransaction: null,
      },
      select: { id: true, amount: true },
    });

    if (transactions.length === 0) {
      throw new BadRequestException('No eligible transactions found for this period');
    }

    const totalAmount = transactions.reduce(
      (sum, txn) => sum + Number(txn.amount),
      0,
    );
    const transactionCount = transactions.length;

    // Use a Prisma transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      // 1. Create the Settlement
      const settlement = await prisma.settlement.create({
        data: {
          merchant_id: merchantId,
          total_amount: totalAmount,
          transaction_count: transactionCount,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'processed',
        },
      });

      // 2. Link transactions to the settlement
      const settlementTransactionsData = transactions.map((txn) => ({
        settlement_id: settlement.id,
        transaction_id: txn.id,
      }));

      await prisma.settlementTransaction.createMany({
        data: settlementTransactionsData,
      });

      return settlement;
    });
  }

  async findAll(merchantId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where: { merchant_id: merchantId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.settlement.count({ where: { merchant_id: merchantId } }),
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
    return this.prisma.settlement.findFirst({
      where: { id, merchant_id: merchantId },
      include: {
        transactions: {
          include: {
            transaction: true,
          },
        },
      },
    });
  }
}
