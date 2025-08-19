// auth.controller.ts
import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationEntity } from 'src/entities/notification.entity';
import { ContactMessage } from 'src/entities/ContactMessage';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService

  ) { }


  /**
   * 
   * @returns 
   * nombre total d'organisateur active
   */

  @Get('/count-users')
  async findCountUsers(): Promise<number> {
    return this.authService.findCountUsers();
  }


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
  }


  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   * 
   * creation des des personnel avec leur rol
   */

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  

  /**
   * 
   * @param req 
   * @param res 
   * @returns 
   * Hybride role
   * 
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const tokenResponse = await this.authService.login(req.user);
    const { access_token } = tokenResponse;
    const user = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      photo: req.user.photo || '',
      role: req.user.role || 'organisateur',
      isInPersonnel: req.user.isInPersonnel || false,
    };
  
    const redirectUrl = `https://mastertable.site/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&role=${encodeURIComponent(user.role)}&isInPersonnel=${encodeURIComponent(user.isInPersonnel)}`;

    return res.redirect(redirectUrl);
  }


// @Post('logout')
// async logout(@Req() req: Request, @Res() res: Response) {
//   try {
//     const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//       return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Aucun token fourni' });
//     }

//     const result = await this.authService.logout(token, res);

//     return res.status(HttpStatus.OK).json(result);
//   } catch (error) {
//     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'Erreur lors de la déconnexion',
//       error: error.message,
//     });
//   }
// }



  @Get('ManagerList')
  async getManagerList() {
    return this.authService.getManagerList();
  }

  @Delete('deleteManager/:id')
  async deleteAManager(@Param('id') id: string): Promise<{ message: string }> {
    return this.authService.deleteManager(id);
  }


  @Get('getId')
  @UseGuards(AuthGuard('jwt'))
  async getIdForToken(@Req() req: any): Promise<any> {

    return this.authService.getIdForToken(req.user.email);
  }

  @Get('/org/stats')
  // @UseGuards(AuthGuard('jwt'))
  async getOrgStats(/*@Req() req : any*/): Promise<any> {

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
  @ApiOperation({ summary: 'Obtenir les inscriptions mensuelles (hors personnel)' })
  @ApiResponse({ status: 200, description: 'Retourne les inscriptions par mois' })
  async getMonthlyRegistrations(): Promise<{ month: string; count: number }[]> {
    return this.authService.getMonthlyRegistrations();
  }


  @Get('notifications')
  @ApiOperation({ summary: 'Obtenir les notifications récentes' })
  @ApiResponse({ status: 200, description: 'Retourne les notifications' })
  async getNotifications(): Promise<NotificationEntity[]> {
    return this.authService.getNotifications();
  }


  @Get('messages')
  @ApiOperation({ summary: 'Obtenir les messages de contact' })
  @ApiResponse({ status: 200, description: 'Retourne les messages' })
  async getMessages(): Promise<ContactMessage[]> {
    return this.authService.getMessages();
  }

  //ENDPOINT BY LIOKA
  @Post('register')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads', // dossier où stocker l'image
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: { fileSize: 20 * 1024 * 1024 } //20Mo 
  }))
  async register(
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Champs requis manquants');
    }
    return this.authService.registerUser({
      ...body,
      photo: file?.filename || null,
    });
  }

  @Post('login')
async login(@Body() body: any) {
  const { email, password } = body;

  if (!email || !password) {
    throw new BadRequestException('Email et mot de passe requis');
  }

  return this.authService.loginUser(email, password);
}


}