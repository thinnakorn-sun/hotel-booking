import { Controller, Get } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('transactions')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('admin/list')
  listForAdmin() {
    return this.ledgerService.findAllTransactionsForAdmin();
  }
}
