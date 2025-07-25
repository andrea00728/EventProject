// auth.controller.ts
import { Controller, Get, UseGuards, Req, Res, Body, Post, Delete, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-auth.dto';
import { User } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService
  
  ) {}

    
  /**
   * 
   * @returns 
   * nombre total d'organisateur active
   */

  @Get('/count-users')
  async findCountUsers():Promise<number>{
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
  async createUser(@Body() dto: CreateUserDto){
    return this.authService.createUser(dto);
  }

  /***
   * 
   * 
   * commentena fotsin alony mba itestena ilay Hybride rol
   * 
   */
  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthRedirect(@Req() req, @Res() res) {
  //   const tokenResponse = await this.authService.login(req.user);
  //   const { access_token } = tokenResponse;
  //   const user = {
  //     id: req.user.id,
  //     email: req.user.email,
  //     name: req.user.name,
  //     photo: req.user.photo || '', 
  //     role: req.user.role || 'organisateur', 
  //   };

  
  // //  const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}`;
  //   const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&role=${encodeURIComponent(user.role)}`;

  //   return res.redirect(redirectUrl);
  // }

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
      isInPersonnel:req.user.isInPersonnel  || false,
    };

  
  
    const redirectUrl = `http://localhost:5173/callback?token=${access_token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&photo=${encodeURIComponent(user.photo)}&role=${encodeURIComponent(user.role)}&isInPersonnel=${encodeURIComponent(user.isInPersonnel)}`;

    return res.redirect(redirectUrl);
  }

   //register manuel dans formumaire
  //  @Post('register')
  //  @ApiConsumes('multipart/form-data')
  //  @ApiBody({
  //    schema: {
  //      type: 'object',
  //      properties: {
  //        name: { type: 'string' },
  //        email: { type: 'string' },
  //        password: { type: 'string' },
  //        photo: { type: 'string', format: 'binary' },
  //      },
  //    },
  //  })
  //  @UseInterceptors(FileInterceptor('photo', {
  //    storage: diskStorage({
  //      destination: './uploads',  // dossier de stockage
  //      filename: (req, file, callback) => {
  //        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //        const ext = extname(file.originalname);
  //        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
  //        callback(null, filename);
  //      },
  //    }),
  //  }))


@Post('logout')
  async logout(@Req() req, @Res() res) {
    const user = req.user;
    await this.authService.logout(user);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, 
    });
    return res.status(200).json({ message: 'Déconnecté avec succès' });
  }

  @Get('ManagerList')
  async getManagerList() {
    return this.authService.getManagerList();
  }

  @Delete('deleteManager/:id')
  async deleteAManager(@Param('id') id: string): Promise<{ message: string }> {
    return this.authService.deleteManager(id);
  }


}