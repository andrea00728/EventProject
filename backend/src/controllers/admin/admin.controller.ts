import { Controller, Get, HttpStatus, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
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

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.adminService.logout(req, res); // Passer l'objet de requête complet
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Erreur lors de la déconnexion',
      });
    }
  }

  @Get('clearCookies')
  async clearCookies(@Req() req: Request, @Res() res: Response) {
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // à mettre sur true en production HTTPS
    });
    res.clearCookie('refresh_token', { /* options */ });

    (req as any).user = null; // optionnel
  
    return res.status(HttpStatus.OK).json({
        message: 'Déconnexion réussie',
    });
  }
}

