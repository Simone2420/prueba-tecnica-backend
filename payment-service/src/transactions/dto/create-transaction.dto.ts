import { IsEnum, IsNumber, IsOptional, IsObject } from 'class-validator';
import { Currency, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
