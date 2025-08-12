// auth.controller.ts
import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { User } from './entities/auth.entity';
import { Request, Response } from 'express';

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
  
    const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&role=${encodeURIComponent(user.role)}&isInPersonnel=${encodeURIComponent(user.isInPersonnel)}`;

    return res.redirect(redirectUrl);
  }


@Post('logout')
async logout(@Req() req: Request, @Res() res: Response) {
  try {
    const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Aucun token fourni' });
    }

    const result = await this.authService.logout(token, res);

    return res.status(HttpStatus.OK).json(result);
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Erreur lors de la déconnexion',
      error: error.message,
    });
  }
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
}