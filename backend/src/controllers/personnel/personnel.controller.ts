import { Controller, Post, Body, Get, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { PersonnelService } from 'src/services/personnel/personnel.service';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';
import { AuthGuard } from '@nestjs/passport';


@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post('/create')
   @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreatePersonnelDto, @Req() req) {
    console.log("donne recu:",dto)
    const userId = req.user.id; 
    return this.personnelService.create(dto, userId);
  }

  
  @Get('by-event/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async findByEvent(@Param('eventId') eventId: string) {
    return this.personnelService.findByEvenement(Number(eventId)); 
  }

@Get('/response')
async response(@Query('token') token: string,@Query('action') action: string) {
  if (action === 'confirm') {
    return this.personnelService.confirmEmail(token);
  } else if (action === 'refuse') {
    return this.personnelService.RefuseEmail(token);
  } else {
    throw new BadRequestException("Action non valide. Utilisez 'confirm' ou 'refuse'.");
  }

  
}

@Get('/count/:eventId')
@UseGuards(AuthGuard('jwt'))
 async findCountByEvent(@Param('eventId') eventId: string) {
  const count = await this.personnelService.findCountPersonnelByEvenement(Number(eventId));
  return { count };
}
}
