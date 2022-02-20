import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsModule } from '../emails/emails.module';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';
import { ItineraryActivityRepository } from './itinerary.activity.repository';
import { ItineraryFlightRepository } from './itinerary.flight.repository';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryService } from './itinerary.service';

@Module({
  imports: [
    EmailsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      ItineraryRepository,
      ItineraryAccommodationRepository,
      ItineraryFlightRepository,
      ItineraryActivityRepository,
    ]),
  ],
  providers: [ItineraryService],
  exports: [TypeOrmModule, ItineraryService],
})
export class ItineraryModule {}
