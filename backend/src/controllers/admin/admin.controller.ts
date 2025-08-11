import { Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/guards/firebase-auth.guard';
import { AdminService } from 'src/services/admin/admin.service';

@Controller('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService) { }

    @UseGuards(FirebaseAuthGuard)
    @Post('/login/admin')
    async logSuperAd(@Req() request : any) {
    const idToken = request.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
        throw new UnauthorizedException('Token manquant');
    }
    return await this.adminService.loginWithFirebase(idToken);
    }
}
