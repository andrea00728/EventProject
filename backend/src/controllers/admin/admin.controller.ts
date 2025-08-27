import { Controller, Post, UseGuards, UploadedFile, UseInterceptors, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from 'src/services/admin/admin.service';
import { FirebaseAuthGuard } from 'src/guards/firebase-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('/login/admin')
  async logSuperAd(@Headers('authorization') authHeader: string) {
    const idToken = authHeader?.split('Bearer ')[1];
    if (!idToken) throw new UnauthorizedException('Token manquant');
    return await this.adminService.loginWithFirebase(idToken);
  }

  // -----------------------------
  // Mettre à jour le profil admin
  // -----------------------------
  @UseGuards(FirebaseAuthGuard)
  @Post('/update-profile')
  @UseInterceptors(FileInterceptor('photo'))
  async updateProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { name?: string; bio?: string },
    @Headers('authorization') authHeader: string,
  ) {
    const idToken = authHeader?.split('Bearer ')[1];
    if (!idToken) throw new UnauthorizedException('Token manquant');

    const updateData: { name?: string; bio?: string; photo?: string } = {
      name: body.name,
      bio: body.bio,
      photo: file ? file.buffer.toString('base64') : undefined, // transforme la photo en base64
    };

    return this.adminService.updateProfile(idToken, updateData);
  }
}
