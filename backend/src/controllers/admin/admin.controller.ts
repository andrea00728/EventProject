import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AdminService } from 'src/services/admin/admin.service';
import { FirebaseAuthGuard } from 'src/guards/firebase-auth.guard';

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

    await this.adminService.loginWithGoogleOAuth(user, res);
    // on met le token dans un cookie
    const redirectUrl = `http://mastertable.site/AdminAccueil`;
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

  @UseGuards(AuthGuard('jwt')) // Protégé par JWT
  @Post('update-password')
  async updatePassword(
    @Req() req,
    @Body() body: { newPassword: string },
  ) {
    const adminId = req.user.id; // ID de l’utilisateur récupéré depuis le JWT
    return this.adminService.updatePassword(
      adminId,
      body.newPassword,
    );
  }

  @Post('login-email')
  async loginWithEmail(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.loginWithEmailAndPass(body, res);
    return result;
  }


  @UseGuards(AuthGuard('jwt'))
  @Get('has-password')
  async checkHasPassword(@Req() req: any) {
    const adminId = req.user.id; // récupéré depuis le token JWT
    return this.adminService.hasPassword(adminId);
  }

}
