import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private adminClient: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  getAdminClient(): SupabaseClient {
    if (this.adminClient) {
      return this.adminClient;
    }
    const url = this.config.get<string>('supabase.url');
    const key = this.config.get<string>('supabase.serviceRoleKey');
    if (!url || !key) {
      throw new Error(
        'Supabase admin client requires supabase URL and SUPABASE_SERVICE_ROLE_KEY',
      );
    }
    this.adminClient = createClient(url, key);
    return this.adminClient;
  }

  getAnonKey(): string {
    return this.config.get<string>('supabase.anonKey') ?? '';
  }
}
