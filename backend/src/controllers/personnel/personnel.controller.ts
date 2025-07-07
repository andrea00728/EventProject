import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
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
}
