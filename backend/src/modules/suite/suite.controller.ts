import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SUITE_RESOURCE_SEGMENT } from './constants/suite-route';
import { CreateSuiteDto } from './dto/create-suite.dto';
import { UpdateSuiteStatusDto } from './dto/update-suite-status.dto';
import { SuiteService } from './suite.service';

@Controller(SUITE_RESOURCE_SEGMENT)
export class SuiteController {
  constructor(private readonly suiteService: SuiteService) {}

  @Get()
  findAll() {
    return this.suiteService.findAll();
  }

  @Post()
  create(@Body() dto: CreateSuiteDto) {
    return this.suiteService.create(dto);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSuiteStatusDto,
  ) {
    return this.suiteService.updateStatus(id, dto.status);
  }
}
