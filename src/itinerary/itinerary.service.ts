import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ItineraryDto } from './dto/itinerary.dto';
import { ItineraryRepository } from './itinerary.repository';
import { Event } from '../events/events.entity';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';
import { ItineraryFlightRepository } from './itinerary.flight.repository';
import { Itinerary } from './itinerary.entity';
import { EmailsService } from '../emails/emails.service';
import { Poll } from '../polls/polls.entity';
import { ItineraryActivityRepository } from './itinerary.activity.repository';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectRepository(ItineraryRepository)
    private itineraryRepository: ItineraryRepository,
    @InjectRepository(ItineraryAccommodationRepository)
    private itineraryAccommodationRepository: ItineraryAccommodationRepository,
    @InjectRepository(ItineraryFlightRepository)
    private itineraryFlightRepository: ItineraryFlightRepository,
    @InjectRepository(ItineraryActivityRepository)
    private itineraryActivityRepository: ItineraryActivityRepository,
    private emailsService: EmailsService,
  ) {}

  async createEventItinerary(
    itineraryDto: ItineraryDto,
    event: Event,
  ): Promise<void> {
    try {
      const { accommodation, flight, activities } = itineraryDto;

      const newItinerary = await this.itineraryRepository.create({
        event: event,
      });

      await this.itineraryRepository.save(newItinerary);

      for (let item in accommodation) {
        const accommodationDbEntry =
          await this.itineraryAccommodationRepository.create({
            title: accommodation[item].title,
            bookingPreviewLink: accommodation[item].bookingPreviewLink,
            bookingSiteDisplayLocationMapLink:
              accommodation[item].bookingSiteDisplayLocationMapLink,
            bookingSiteLink: accommodation[item].bookingSiteLink,
            freeCancellationText: accommodation[item].freeCancellationText,
            locationDistance: accommodation[item].locationDistance,
            numberOfBedsRecommendedBooking:
              accommodation[item].numberOfBedsRecommendedBooking,
            price: accommodation[item].price,
            ratingScore: accommodation[item].ratingScore,
            ratingScoreCategory: accommodation[item].ratingScoreCategory,
            reviewQuantity: accommodation[item].reviewQuantity,
            roomTypeRecommendedBooking:
              accommodation[item].roomTypeRecommendedBooking,
            itinerary: newItinerary,
            startDate: accommodation[item].startDate,
            endDate: accommodation[item].endDate,
            locationTitle: accommodation[item].locationTitle,
            numberOfNightsAndGuests:
              accommodation[item].numberOfNightsAndGuests,
            numberOfRoomsRecommendedBooking:
              accommodation[item].numberOfRoomsRecommendedBooking,
          });

        await this.itineraryAccommodationRepository.save(accommodationDbEntry);
      }

      for (let item in flight) {
        const flightDbEntry = await this.itineraryFlightRepository.create({
          departureTime: flight[item].departureTime,
          arrivalTime: flight[item].arrivalTime,
          departureCity: flight[item].departureCity,
          arrivalCity: flight[item].arrivalCity,
          airport: flight[item].airport,
          duration: flight[item].duration,
          directFlight: flight[item].directFlight,
          carrier: flight[item].carrier,
          pricePerPerson: flight[item].pricePerPerson,
          priceTotal: flight[item].priceTotal,
          flightUrl: flight[item].flightUrl,
          itinerary: newItinerary,
        });

        await this.itineraryFlightRepository.save(flightDbEntry);
      }

      for (let item in activities) {
        const activityDbEntry = await this.itineraryActivityRepository.create({
          itinerary: newItinerary,
          name: activities[item].name,
          vicinity: activities[item].vicinity,
          rating: activities[item].rating,
          user_ratings_total: activities[item].user_ratings_total,
          mapLink: activities[item].mapLink,
          placesId: activities[item].placesId,
        });

        await this.itineraryActivityRepository.save(activityDbEntry);
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getEventItinerary(event: Event): Promise<Itinerary> {
    try {
      const itinerary = await this.itineraryRepository.findOne(
        { event: event },
        { relations: ['accommodation', 'flight', 'activities'] },
      );
      return itinerary;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteEventItinerary(event: Event): Promise<any> {
    return this.itineraryRepository.delete({ event: event });
  }

  async updateEventItinerary(
    itineraryDto: ItineraryDto,
    event: Event,
  ): Promise<any> {
    const itinerary = await this.itineraryRepository.findOne({ event: event });
    await this.itineraryRepository.update(itinerary.id, {
      ...(itineraryDto.completed && { completed: itineraryDto.completed }),
    });
    if (itineraryDto.accommodation.length > 0) {
      await this.itineraryAccommodationRepository.updateItineraryAccommodation(
        itineraryDto.accommodation,
        itinerary,
      );
    }
    if (itineraryDto.activities.length > 0) {
      await this.itineraryActivityRepository.updateItineraryActivities(
        itineraryDto.activities,
        itinerary,
      );
    }
    if (itineraryDto.flight.length > 0) {
      await this.itineraryFlightRepository.updateItineraryFlights(
        itineraryDto.flight,
        itinerary,
      );
    }

    if (itineraryDto.completed) {
      for (let user in event.invitedUsers) {
        //commenting out to save on email API calls
        //await this.emailsService.sendCompletedItineraryEmail(event.title, event.invitedUsers[user].email, itineraryDto.accommodation, itineraryDto.flight);
      }
    }
  }
}
