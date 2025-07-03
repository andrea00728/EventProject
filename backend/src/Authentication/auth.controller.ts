import { Controller, Get, Patch, Body, Param, UseGuards, Req, Res, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

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
      roles: req.user.roles,
    };

    const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&roles=${encodeURIComponent(JSON.stringify(user.roles))}`;
    
    return res.redirect(redirectUrl);
  }

  @Patch('users/:id/role/:eventId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async updateUserRole(
    @Param('id') id: string,
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body('role') role: 'admin' | 'cuisine' | 'caisse' | 'client',
  ) {
    return this.authService.updateUserRole(id, eventId, role);
  }
}