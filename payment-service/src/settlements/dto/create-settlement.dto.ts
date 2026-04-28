import { IsDateString } from 'class-validator';

export class CreateSettlementDto {
  @IsDateString()
  period_start: string;

  @IsDateString()
  period_end: string;
}
