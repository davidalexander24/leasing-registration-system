import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export interface CurrentRequestUser {
  userId: number;
  email: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentRequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentRequestUser }>();
    if (!request.user) {
      return undefined;
    }
    return data ? request.user[data] : request.user;
  },
);
