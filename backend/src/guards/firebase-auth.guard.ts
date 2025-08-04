import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import admin from 'src/firebase/firebase-admin'; 

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant');
    }
    
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}