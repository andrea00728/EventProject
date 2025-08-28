import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    
    if (!req.headers.authorization && req.cookies?.jwt) {
      req.headers.authorization = `Bearer ${req.cookies.jwt}`;
    }
    
    return req;
  }
}
