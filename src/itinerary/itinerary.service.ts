import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

  private logger: Logger = new Logger('ItineraryService');

  async createEventItinerary(
    itineraryDto: ItineraryDto,
    event: Event,
  ): Promise<Itinerary> {
    try {
      const { accommodation, flight, activities } = itineraryDto;

      const newItinerary = await this.itineraryRepository.create({
        event: event,
      });

      const result = await this.itineraryRepository.save(newItinerary);

      this.logger.log(`Itinerary created - id: ${newItinerary.id}`)

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

        this.logger.log(`Adding new itinerary accommmodation item - id: ${accommodationDbEntry.id}`)
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

        this.logger.log(`Adding new itinerary flight item - id: ${flightDbEntry.id}`)
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

        this.logger.log(`Adding new itinerary activity item - id: ${activityDbEntry.id}`)

        return result;
      }
    } catch (error) {
      this.logger.log(error)
      throw new InternalServerErrorException();
    }
  }

  async getEventItinerary(event: Event): Promise<Itinerary> {
    try {
      const itinerary = await this.itineraryRepository.findOne(
        { event: event },
        { relations: ['accommodation', 'flight', 'activities'] },
      );
      this.logger.log(`Searching for event itinerary - event id: ${event.id}`)
      return itinerary;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async deleteEventItinerary(event: Event): Promise<any> {
    this.logger.log(`Deleting event itinerary for event - ${event.id}`)
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

    this.logger.log(`Itinerary Updated - ${itinerary.id}`)
    if (itineraryDto.accommodation.length > 0) {
      await this.itineraryAccommodationRepository.updateItineraryAccommodation(
        itineraryDto.accommodation,
        itinerary,
      );
      this.logger.log(`Itinerary accommodation items updated for itinerary - ${itinerary.id}`)
    }
    if (itineraryDto.activities.length > 0) {
      await this.itineraryActivityRepository.updateItineraryActivities(
        itineraryDto.activities,
        itinerary,
      );

      this.logger.log(`Itinerary activity items updated for itinerary - ${itinerary.id}`)
    }
    if (itineraryDto.flight.length > 0) {
      await this.itineraryFlightRepository.updateItineraryFlights(
        itineraryDto.flight,
        itinerary,
      );

      this.logger.log(`Itinerary flight items updated for itinerary - ${itinerary.id}`)
    }

    if (itineraryDto.completed) {
      for (let user in event.invitedUsers) {
        //commenting out to save on email API calls
        //await this.emailsService.sendCompletedItineraryEmail(event.title, event.invitedUsers[user].email, itineraryDto.accommodation, itineraryDto.flight);
      }
    }
  }
}
