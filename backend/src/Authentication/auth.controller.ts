import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param, UseInterceptors, UploadedFile, BadRequestException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ContactMessage } from 'src/entities/ContactMessage';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from './entities/auth.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { JwtPayload } from 'src/interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  jwtService: any;
  userRepository: any;
  constructor(private readonly authService: AuthService) {}

  @Get('/count-users')
  async findCountUsers(): Promise<number> {
    return this.authService.findCountUsers();
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.login(req.user, res);
    if (result?.error) {
      console.error('❌ Erreur Google Auth:', result.error);
      return res.redirect(
        `http://localhost:5173/?error=${encodeURIComponent(result.error)}`
      );
    }
    return res.redirect(`http://localhost:5173/callback`);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.logout(req, res);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Erreur lors de la déconnexion',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAuthStatus(@Req() req: Request & { user: JwtPayload }) {
    const user = await this.authService.getStatus(req.user.sub);
    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
      },
    };
  }

  @Get('ManagerList')
  async getManagerList() {
    return this.authService.getManagerList();
  }

  @Delete('deleteManager/:id')
  async deleteAManager(@Param('id') id: string): Promise<{ message: string }> {
    return this.authService.deleteManager(id);
  }

  @Get('getId')
  @UseGuards(JwtAuthGuard)
  async getIdForToken(@Req() req: any): Promise<any> {
    return this.authService.getIdForToken(req.user.email);
  }

  @Get('/org/stats')
  async getOrgStats(): Promise<any> {
    return this.authService.findOrgStats();
  }

  @Get('/user/stats')
  async getUserStats(): Promise<any> {
    return this.authService.findUserStats();
  }

  @Get('/session-stats')
  async getSessionTimeStats(): Promise<any> {
    return this.authService.findSessionTimeStats();
  }

  @Get('user-role-stats')
  async getUserRoleStats() {
    return this.authService.getUserRoleStats();
  }

  @Get('monthly-registrations')
  async getMonthlyRegistrations(): Promise<{ month: string; count: number }[]> {
    return this.authService.getMonthlyRegistrations();
  }

  @Get('notifications')
  async getNotifications(): Promise<NotificationEntity[]> {
    return this.authService.getNotifications();
  }

  @Get('messages')
  async getMessages(): Promise<ContactMessage[]> {
    return this.authService.getMessages();
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './Uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 },
  }))
  async register(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Champs requis manquants');
    }
    return this.authService.registerUser({ ...body, photo: file?.filename || null });
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequestException('Email et mot de passe requis');
    return this.authService.loginUser(email, password, res);
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Aucun refresh token fourni');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'andreanadjasylvanoilaina',
      });
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      const newPayload = { sub: user.id, email: user.email, role: user.role, name: user.name, photo: user.photo };
      const access_token = this.jwtService.sign(newPayload, { expiresIn: '1h' });

      res.cookie('jwt', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      return { message: 'Token rafraîchi avec succès' };
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  @Get('validate-token')
  async validateToken(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || await this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Jeton invalide ou blacklisté');
    }
    return { valid: true };
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './Uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Mettre à jour le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async updateProfile(
    @Req() req: Request & { user: JwtPayload },
    @Body() body: { name: string; email: string; current_password?: string; new_password?: string; new_password_confirmation?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.sub;
    const updatedData = await this.authService.updateProfile(userId, {
      name: body.name,
      email: body.email,
      currentPassword: body.current_password,
      newPassword: body.new_password,
      newPasswordConfirmation: body.new_password_confirmation,
      photo: file?.filename || null,
    });
    return {
      message: 'Profil mis à jour avec succès',
      user: updatedData.user,
      token: updatedData.token,
    };
  }
}