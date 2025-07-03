import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const eventId = parseInt(request.params.eventId || request.body.eventId || request.query.eventId, 10);

    if (!user || !user.roles || !eventId) return false;

    const userRole = user.roles.find((r: { eventId: number; role: string }) => r.eventId === eventId)?.role;
    return userRole && requiredRoles.includes(userRole);
  }
}