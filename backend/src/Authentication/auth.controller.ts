// auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
  }

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
    };

  
   const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}`;
    
    return res.redirect(redirectUrl);
  }
}