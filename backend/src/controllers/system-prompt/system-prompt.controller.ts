import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { SystemPromptService } from 'src/services/system-prompt/system-prompt.service';
import { CreateSystemPromptDto, UpdateSystemPromptDto } from 'src/dto/system-prompt.dto';

@Controller('system-prompt')
export class SystemPromptController {
  constructor(private readonly systemPromptService: SystemPromptService) {}

  @Post()
  async create(@Body() createDto: CreateSystemPromptDto) {
    return this.systemPromptService.createPrompt(createDto);
  }

  @Get()
  async findAll() {
    return this.systemPromptService.getPrompts();
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateSystemPromptDto) {
    return this.systemPromptService.updatePrompt(Number(id), updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.systemPromptService.deletePrompt(Number(id));
  }
}