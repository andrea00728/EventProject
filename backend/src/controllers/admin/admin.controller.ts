import { Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/guards/firebase-auth.guard';
import { AdminService } from 'src/services/admin/admin.service';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('/login/admin')
  async logSuperAd(@Req() request: any, @Res({ passthrough: true }) res: Response) {
    // Récupérer le token Firebase depuis le header Authorization
    const idToken = request.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      throw new UnauthorizedException('Token manquant');
    }

    // Appel au service avec mise en cookie
    return await this.adminService.loginWithFirebaseAndCookie(idToken, res);
  }

  @Post('/logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    res.clearCookie('refresh_token');
    return { message: 'Déconnecté avec succès' };
  }
}

