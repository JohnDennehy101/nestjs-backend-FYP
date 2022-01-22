import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';
import { ItineraryFlightRepository } from './itinerary.flight.repository';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryService } from './itinerary.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([ItineraryRepository, ItineraryAccommodationRepository, ItineraryFlightRepository]),
  ],
  providers: [ItineraryService],
  exports: [
    TypeOrmModule,
    ItineraryService
  ]
})
export class ItineraryModule {}
