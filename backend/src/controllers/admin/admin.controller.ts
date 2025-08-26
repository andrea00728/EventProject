import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AdminService } from 'src/services/admin/admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly jwtService: JwtService, 
    private readonly adminService: AdminService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google-admin'))
  async googleLogin() {
    // redirige vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google-admin'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;

    const payload = { email: user.email, sub: user.providerId };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    await this.adminService.loginWithGoogleOAuth(user, res);
    // on met le token dans un cookie
    const redirectUrl = `http://localhost:5173/AdminAccueil`;
    return res.redirect(redirectUrl);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.adminService.logout(req, res);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Erreur lors de la déconnexion',
      });
    }
  }
}
