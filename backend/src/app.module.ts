import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { BookingModule } from './modules/booking/booking.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { SuiteModule } from './modules/suite/suite.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    SupabaseModule,
    SuiteModule,
    BookingModule,
    AdminModule,
    LedgerModule,
    UserModule,
  ],
})
export class AppModule {}
