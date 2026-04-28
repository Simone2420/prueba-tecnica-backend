import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { ApiKeyGuard } from '../auth/guards/api-key/api-key.guard';
import { CurrentMerchant } from '../auth/decorators/current-merchant/current-merchant.decorator';
import type { Merchant } from '@prisma/client';

@Controller('settlements')
@UseGuards(ApiKeyGuard)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Post()
  create(
    @CurrentMerchant() merchant: Merchant,
    @Body() createSettlementDto: CreateSettlementDto,
  ) {
    return this.settlementsService.create(merchant.id, createSettlementDto);
  }

  @Get()
  findAll(
    @CurrentMerchant() merchant: Merchant,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.settlementsService.findAll(
      merchant.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentMerchant() merchant: Merchant) {
    return this.settlementsService.findOne(id, merchant.id);
  }
}
