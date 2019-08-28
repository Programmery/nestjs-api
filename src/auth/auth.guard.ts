import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly secretKey = process.env.SECRET_KEY;

  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerHeader = request.headers.authorization;
    if (bearerHeader && bearerHeader.split(' ')[0] === 'Bearer') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      try {
        jwt.verify(bearerToken, this.secretKey);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
