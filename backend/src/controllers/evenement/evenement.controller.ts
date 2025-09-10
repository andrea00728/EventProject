import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  UseGuards,
  Req,
  UnauthorizedException,
  Delete,
  UploadedFile,
  UseInterceptors,
  Put,
  NotFoundException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEventDto, UpdateEventDto } from 'src/dto/CreateEvenementDTO';
import { Evenement } from 'src/entities/Evenement';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';

@Controller('evenements')
export class EvenementController {
  constructor(
    private readonly evenementService: EvenementService,
    private readonly forfaitService: ForfaitService,
  ) {}

@Post()
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadDir = path.resolve(__dirname, '../../../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir);
      },
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        callback(null, `${uniqueName}${ext}`);
      },
    }),
  }),
)
async create(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateEventDto,
  @Req() req: any,
): Promise<Evenement> {
  console.log('Requête POST reçue:', { dto, file, user: req.user });

  const userIdFromToken = req.user?.sub;
  if (!userIdFromToken) {
    throw new UnauthorizedException('Utilisateur non authentifié');
  }

  await this.forfaitService.checkForfaitExpiration(userIdFromToken);

  const canCreateEvent = await this.forfaitService.canCreateEvent(userIdFromToken);
  if (!canCreateEvent) {
    throw new BadRequestException("Vous avez atteint le nombre maximum d'événements");
  }

  dto.utilisateur_id = userIdFromToken;

  if (file) {
    // Préparer le chemin relatif pour la DB ou l'accès statique
    dto.imageUrl = `/uploads/${file.filename}`;
  }

  try {
    return await this.evenementService.create(dto);
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    if (error.code === '23505') {
      throw new BadRequestException("Vous avez déjà créé un événement avec ce nom.");
    }
    throw new BadRequestException(error.message || "Erreur lors de la création de l'événement");
  }
}


@Put(':id')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: '../../../Uploads/events',
      filename: (req, file, cb) => {
        const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        return cb(null, `${randomName}${path.extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Seules les images sont autorisées'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
)
async updateEvent(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateEventDto,
  @UploadedFile() imageFile?: Express.Multer.File,
){
  return this.evenementService.updateEvent(id, dto, imageFile);
}


  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async findUserEvenement(@Req() req: any): Promise<Evenement[]> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.evenementService.findByUser(userIdFromToken);
  }

  @Get()
  async findAll() {
    return this.evenementService.findAll();
  }

  @Get('/countEvent')
  async findCountEvents(): Promise<number> {
    return this.evenementService.findCountEvents();
  }

  @Get('publics')
  async findPublicEvents(): Promise<Evenement[]> {
    return this.evenementService.findPublicEvents();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evenementService.findOne(+id);
  }

  @Delete(':id/delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteEvent(@Param('id') id: number, @Req() req: any): Promise<{ message: string }> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.evenementService.deleteEvent(id, userIdFromToken);
  }

  @Get(':id/managerEvents')
  async findManagerEvents(@Param('id') id: string) {
    return this.evenementService.findManagerEvents(id);
  }

  @Get('/events/statistics')
  async findCountForAllEventStats(): Promise<any> {
    return this.evenementService.findCountForAllEventStats();
  }
}