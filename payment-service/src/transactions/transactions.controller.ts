import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { CurrentMerchant } from '../auth/decorators/current-merchant/current-merchant.decorator';
import { Merchant } from '@prisma/client';

@Controller('transactions')
@UseGuards(ApiKeyGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentMerchant() merchant: Merchant,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(merchant.id, createTransactionDto);
  }

  @Get()
  findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.transactionsService.findAll(
      merchant.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentMerchant() merchant: Merchant) {
    return this.transactionsService.findOne(id, merchant.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @CurrentMerchant() merchant: Merchant,
    @Body() updateDto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, merchant.id, updateDto);
  }
}
