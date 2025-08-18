import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user?.email === 'eliasvano78@gmail.com') {
      return true;
    }
    throw new ForbiddenException('Accès réservé au superAdmin');
  }
}