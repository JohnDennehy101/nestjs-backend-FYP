import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExternalApiRequestsService } from './external-api-requests.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [ExternalApiRequestsService],
  exports: [ExternalApiRequestsService],
})
export class ExternalApiRequestsModule {}
