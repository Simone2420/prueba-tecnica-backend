import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Merchant } from '@prisma/client';

export const CurrentMerchant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Merchant => {
    const request = ctx.switchToHttp().getRequest();
    return request.merchant;
  },
);
