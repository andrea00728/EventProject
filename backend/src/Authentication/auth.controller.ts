// auth.controller.ts
import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { User } from './entities/auth.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

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
  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthRedirect(@Req() req, @Res() res) {
  //   const tokenResponse = await this.authService.login(req.user,res);
  //   const { access_token } = tokenResponse;
  //   const user = {
  //     id: req.user.id,
  //     email: req.user.email,
  //     name: req.user.name,
  //     photo: req.user.photo || '',
  //     role: req.user.role || 'organisateur',
  //     isInPersonnel: req.user.isInPersonnel || false,
  //   };
  
  //   const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&role=${encodeURIComponent(user.role)}&isInPersonnel=${encodeURIComponent(user.isInPersonnel)}`;

  //   return res.redirect(redirectUrl);
  // }

  // auth.controller.ts
@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req, @Res() res) {
  // Le service de connexion définit déjà les cookies
  await this.authService.login(req.user, res);

  // Redirige simplement vers la page de rappel sans paramètres
  const redirectUrl = `http://localhost:5173/callback`;

  return res.redirect(redirectUrl);
}

@Post('logout')
async logout(@Req() req: Request, @Res() res: Response) {
  try {
    const result = await this.authService.logout(req, res); // Passer l'objet de requête complet
    return res.status(HttpStatus.OK).json(result);
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: error.message || 'Erreur lors de la déconnexion',
    });
  }
}

 @UseGuards(JwtAuthGuard)
  @Get('status')
  async getAuthStatus(@Req() req) {
    // Si ce point de terminaison est atteint, le JWT est valide
    return {
      isAuthenticated: true,
      user: req.user, // Contient les informations de l'utilisateur du payload JWT
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


  /**
   * 
   * @param req 
   * mis a jour d'aujourd'hui
   * @returns 
   */
  @Get('validate-token')
async validateToken(@Req() req: Request) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || await this.authService.isTokenBlacklisted(token)) {
    throw new UnauthorizedException('Jeton invalide ou blacklisté');
  }
  return { valid: true };
}

}