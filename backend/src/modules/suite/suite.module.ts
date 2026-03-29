import { Module } from '@nestjs/common';
import { SuiteResponseMapper } from './mappers/suite-response.mapper';
import { SuiteController } from './suite.controller';
import { SuiteRepository } from './suite.repository';
import { SuiteService } from './suite.service';

@Module({
  controllers: [SuiteController],
  providers: [SuiteService, SuiteRepository, SuiteResponseMapper],
  exports: [SuiteRepository, SuiteService],
})
export class SuiteModule {}
