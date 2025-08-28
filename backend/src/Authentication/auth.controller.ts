import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param, UseInterceptors, UploadedFile, BadRequestException, HttpStatus, UnauthorizedException, HttpCode } from '@nestjs/common';
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
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('/count-users')
  async findCountUsers(): Promise<number> {
    return this.authService.findCountUsers();
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    await this.authService.login(req.user, res);
    return res.redirect(`http://localhost:5173/callback`);
  }

@Post('login')
@HttpCode(HttpStatus.OK)
async login(@Body() body: any, @Res() res: Response) {
  const { email, password } = body;
  try {
    const result = await this.authService.loginUser(email, password, res);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ 
      message: error.message || 'Email ou mot de passe invalide' 
    });
  }
}

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return res.json({ message: 'Déconnecté avec succès' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAuthStatus(@Req() req) {
    return {
      isAuthenticated: true,
      user: req.user,
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
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // 20Mo
  }))
  async register(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Champs requis manquants');
    }
    return this.authService.registerUser({ ...body, photo: file?.filename || null });
  }


  @Get('validate-token')
  async validateToken(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || await this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Jeton invalide ou blacklisté');
    }
    return { valid: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
  @UseInterceptors(FileInterceptor('photo', { dest: './uploads' }))
  async updateProfile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name?: string }
  ) {
    const userId = req.user.sub;
    return this.authService.updateProfile(userId, {
      name: body.name,
      photo: file?.filename, // tu sauvegardes le nom du fichier
    });
  }




 //Login user manuel
  //Login user manuel

}
