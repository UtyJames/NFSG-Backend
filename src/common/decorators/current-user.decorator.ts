import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminUser } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Partial<AdminUser> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
