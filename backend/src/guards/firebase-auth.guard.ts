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
    console.log('token : ', token)
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return true;
    } catch (err) {
      console.error('Firebase Token Verification Failed:', err); // 🔥 Ce log va te dire pourquoi ça échoue
      throw new UnauthorizedException('Token invalide');
    }

  }
}