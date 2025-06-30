/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Controller, Get, Req, Res, UseGuards, Post, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/auth.service';
import { UsersService } from '../../services/users/users.service';

interface GoogleUser {
  googleId: string;
  email: string;
  name?: string;
  picture?: string | null;
  accessToken?: string;
  role?: 'admin' | 'organisateur';
}

interface AuthenticatedRequest extends Request {
  user: GoogleUser & { id?: number; access_token?: string };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    res.sendStatus(200);
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const userWithName: GoogleUser = {
      ...req.user,
      name: req.user.name || 'Unknown',
      accessToken: req.user.accessToken || undefined,
    };
    const user = await this.authService.validateOrRegisterUser(userWithName);
    if (!user) {
      throw new NotFoundException('Utilisateur non valide après authentification');
    }
    res.redirect(`/profile?userId=${user.id}&photoUrl=${encodeURIComponent(user.photoUrl || '')}&access_token=${user.access_token}`);
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  getProtected(@Req() req: AuthenticatedRequest) {
    return {
      message: 'Route protégée accessible uniquement avec un JWT valide',
      user: req.user,
    };
  }

  @Post('set-role')
  @UseGuards(AuthGuard('jwt'))
  async setRole(@Req() req: AuthenticatedRequest, @Body() body: { role: 'admin' | 'organisateur' }) {
    const user = await this.usersService.findByEmail(req.user.email);
    if (!user) { // Gère maintenant null au lieu de undefined
      throw new NotFoundException(`Utilisateur avec l'email ${req.user.email} non trouvé`);
    }

    const updatedUser = await this.usersService.createOrUpdate({ ...user, role: body.role });
    if (!updatedUser) {
      throw new BadRequestException('Échec de la mise à jour du rôle');
    }

    const googleUser: GoogleUser = {
      googleId: updatedUser.googleId || '',
      email: updatedUser.email,
      name: updatedUser.name || '',
      accessToken: updatedUser.accessToken || undefined,
      role: updatedUser.role,
    };
    const authenticatedUser = await this.authService.validateOrRegisterUser(googleUser);

    return {
      message: 'Rôle mis à jour avec succès',
      user: authenticatedUser,
      access_token: authenticatedUser.access_token,
    };
  }
}