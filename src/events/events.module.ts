import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { PassportModule } from '@nestjs/passport';
import { ExternalApiRequestsModule } from 'src/external-api-requests/external-api-requests.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([EventsRepository]),
    AuthModule,
    ExternalApiRequestsModule
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
