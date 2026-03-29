import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SuiteModule } from '../suite/suite.module';

@Module({
  imports: [SuiteModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
