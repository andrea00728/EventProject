import { Controller, Post, Body, Get, Param, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { PersonnelService } from 'src/services/personnel/personnel.service';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';
import { AuthGuard } from '@nestjs/passport';


@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}


  /**
   * Creates a new personnel
   * @param dto The personnel data to create
   * @param req The request object
   * @returns The created personnel
   */

    @Post('/create')
   @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreatePersonnelDto, @Req() req) {
    console.log("donne recu:",dto)
    const userId = req.user.id; 
    return this.personnelService.create(dto, userId);
  }

 
/**
 * Retrieves personnel associated with a specific event.
 * 
 * This method uses the event ID to find all personnel entries tied 
 * to the specified event. It leverages the personnelService to 
 * perform the search operation.
 * 
 * @param eventId - The ID of the event for which to retrieve personnel.
 * @returns A promise resolving to an array of personnel associated with the event.
 */

 
  @Get('by-event/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async findByEvent(@Param('eventId') eventId: string) {
    return this.personnelService.findByEvenement(Number(eventId)); 
  }

  /*******  Récupèration de la liste des personnels pour l' Admin (Pas encore de restriction) ********* */


  /**
   * Retrieves all personnel associated with a specific event.
   * 
   * This method uses the event ID to find all personnel entries tied 
   * to the specified event. It leverages the personnelService to 
   * perform the search operation.
   * 
   * @param eventId - The ID of the event for which to retrieve personnel.
   * @returns A promise resolving to an array of personnel associated with the event.
   */
  @Get('byEvent/:eventId')
  
  async find_By_Event(@Param('eventId') eventId: string) {
    return this.personnelService.findAllPersonalForOneEvent(Number(eventId)); 
  }

  /*********************************************************************** */


  /**
   * Gère les réponses des personnels suite à une invitation.
   * 
   * @param token Le jeton d'invitation
   * @param action L'action à effectuer. Peut être 'confirm' (confirmer la participation) ou 'refuse' (refuser la participation)
   * 
   * @throws {BadRequestException} Si l'action est non valide.
   */
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

/**
 * Retrieves the count of personnel associated with a specific event.
 * 
 * This method uses the event ID to determine the number of personnel 
 * entries linked to the specified event. It leverages the 
 * personnelService to perform the count operation.
 * 
 * @param eventId - The ID of the event for which to count personnel.
 * @returns A promise resolving to an object containing the count of personnel.
 */


@Get('/count/:eventId')
@UseGuards(AuthGuard('jwt'))
 async findCountByEvent(@Param('eventId') eventId: string) {
  const count = await this.personnelService.findCountPersonnelByEvenement(Number(eventId));
  return { count };
}


/**
 * Retrieves the count of unique departments associated with a specific event.
 * 
 * This method uses the event ID to determine the number of distinct department 
 * roles linked to the specified event. It leverages the personnelService 
 * to perform the count operation.
 * 
 * @param eventId - The ID of the event for which to count unique departments.
 * @returns A promise resolving to an object containing the count of unique departments.
 */


}
