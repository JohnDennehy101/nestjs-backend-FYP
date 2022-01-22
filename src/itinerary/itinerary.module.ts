import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryRepository } from './itinerary.repository';
import { ItineraryService } from './itinerary.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([ItineraryRepository]),
  ],
  providers: [ItineraryService],
  exports: [
    TypeOrmModule,
    ItineraryService
  ]
})
export class ItineraryModule {}
