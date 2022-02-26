import { Test } from '@nestjs/testing';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';
import { ItineraryFlightRepository } from './itinerary.flight.repository';
import { ItineraryActivityRepository } from './itinerary.activity.repository';
import { ItineraryService } from './itinerary.service';
import { ItineraryRepository } from './itinerary.repository';
import { EmailsService } from '../emails/emails.service';

const mockItineraryAccommodationRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  updateItineraryAccommodation: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockCreatedUser = {
  id: '4040403f34u3f3j03',
  email: 'test@gmail.com',
  password: '5434fe34',
  emailConfirmed: false,
  profileImageUrl: null,
  createdEvents: [],
  pollVotes: [],
  invitedEvents: [],
};

const mockEventOne = {
  id: '4040403f34u3f3j03',
  title: 'Test Event',
  type: 'DOMESTIC_DAY',
  userEmails: ['testuser1@gmail.com', 'testuser2@gmail.com'],
  city: 'Cork',
  departureCity: null,
  invitedUsers: [],
  cityLatitude: 7.5,
  cityLongitude: -7.5,
  createdByUser: mockCreatedUser,
  polls: undefined,
};

const mockEventItinerary = {
  flight: [
    {
      departureTime: '04:30',
      arrivalTime: '05:50',
      departureCity: 'Dublin',
      arrivalCity: 'London',
      airport: 'Stansted',
      duration: '1h 30 min',
      directFlight: 'Direct',
      carrier: 'Ryanair',
      pricePerPerson: '€85',
      priceTotal: '€170',
      flightUrl: 'http:skycanner.ie',
      itinerary: [],
    },
  ],
  accommodation: [
    {
      title: 'Skylon',
      bookingPreviewLink: 'http:booking.com',
      bookingSiteDisplayLocationMapLink: 'http:booking.com',
      bookingSiteLink: 'http://booking.com',
      freeCancellationText: 'FREE Cancellation',
      locationDistance: '6km from centre',
      numberOfBedsRecommendedBooking: '2 beds',
      price: '€150',
      ratingScore: '8.6',
      ratingScoreCategory: 'Superb',
      reviewQuantity: '5001',
      roomTypeRecommendedBooking: 'Double Room',
      itinerary: [],
      startDate: '12/12/21',
      endDate: '14/12/21',
      locationTitle: 'Cork',
      numberOfNightsAndGuests: '2 nights, 2 guests',
      numberOfRoomsRecommendedBooking: '1 Double Room',
    },
  ],
  activities: [
    {
      itinerary: [],
      name: 'Opera House',
      vicinity: 'Main Street',
      rating: '8.5',
      user_ratings_total: '2000',
      mapLink: 'http://googlemaps.ie',
      placesId: '101219201029',
    },
  ],
  completed: false,
};

describe('ItineraryAccommodationRepository', () => {
  let itineraryAccommodationRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ItineraryAccommodationRepository,
          useFactory: mockItineraryAccommodationRepository,
        },
      ],
    }).compile();

    itineraryAccommodationRepository = module.get(
      ItineraryAccommodationRepository,
    );
  });

  describe('Updating event itinerary accommodation records', () => {
    it('calls ItineraryAccommodationRepository.updateItineraryAccommodation and returns the result', async () => {
      itineraryAccommodationRepository.create.mockResolvedValue(
        mockEventItinerary.accommodation,
      );

      itineraryAccommodationRepository.update.mockResolvedValue(
        mockEventItinerary.accommodation,
      );

      itineraryAccommodationRepository.find.mockResolvedValue(
        mockEventItinerary.accommodation,
      );

      itineraryAccommodationRepository.delete.mockResolvedValue({
        rowsAffected: 1,
      });

      const updateItineraryAccommodationSpy = jest
        .spyOn(itineraryAccommodationRepository, 'updateItineraryAccommodation')
        .mockResolvedValue(undefined);

      await itineraryAccommodationRepository.updateItineraryAccommodation(
        mockEventItinerary.accommodation,
        mockEventItinerary,
      );

      expect(updateItineraryAccommodationSpy).toHaveBeenCalledWith(
        mockEventItinerary.accommodation,
        mockEventItinerary,
      );
    });
  });
});
