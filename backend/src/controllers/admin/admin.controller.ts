import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, InternalServerErrorException, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
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
  try {
    const user = req.user;
    if (!user) throw new Error('Utilisateur Google non trouvé');

    await this.adminService.loginWithGoogleOAuth(user, res);

    // Redirection en cas de succès
    const redirectUrl = `http://localhost:5173/AdminAccueil`;
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error("Erreur Google OAuth :", error.message);

    // Encoder le message d'erreur pour l'URL
    const errorMsg = encodeURIComponent(error.message || 'Erreur lors de la connexion Google');
    const redirectUrl = `http://localhost:5173/login-site/super/admin?error=${errorMsg}`;
    return res.redirect(redirectUrl);
  }
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

  @Post('update-password')
  @UseGuards(AuthGuard('jwt'))
  async updatePassword(
    @Body() body: { adminId?: string; newPassword: string },
    @Req() req
  ) {
    const adminId = body.adminId || req.user.id; // Si adminId fourni, sinon user courant
    return this.adminService.updatePassword(adminId, body.newPassword);
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


  @UseGuards(AuthGuard('jwt')) // Protégé par JWT
  @Get('all')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateAdmin(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateAdmin(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createAdmin(@Body() user: { name: string; email: string }): Promise<any> {
    try {
      const newAdmin = await this.adminService.createUser(user);
      return newAdmin
    } catch (error) {
      // Si c'est une erreur connue (ex: BadRequestException)
      if (error.status && error.message) {
        throw new BadRequestException(error.message);
      }
      console.error('Erreur serveur lors de la création de l’admin :', error);
      throw new InternalServerErrorException('Impossible de créer l’administrateur pour le moment.');
    }
  }

}
