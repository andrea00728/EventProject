/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@Query('userId') userId: string, @Query('photoUrl') photoUrl: string, @Query('access_token') accessToken: string, @Res() res: Response) {
    // Ici, vous pouvez rendre une page HTML ou renvoyer une réponse JSON
    res.send(`
      <h1>Profil Utilisateur</h1>
      <p>User ID: ${userId}</p>
      <p>Photo URL: <img src="${decodeURIComponent(photoUrl)}" alt="Profile Picture"></p>
      <p>Access Token: ${accessToken}</p>
    `);
  }
}