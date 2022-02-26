import { Test } from '@nestjs/testing';
import { ItineraryAccommodationRepository } from './itinerary.accommodation.repository';
import { ItineraryFlightRepository } from './itinerary.flight.repository';
import { ItineraryActivityRepository } from './itinerary.activity.repository';
import { ItineraryService } from './itinerary.service';
import { ItineraryRepository } from './itinerary.repository';
import { EmailsService } from '../emails/emails.service';

const mockItineraryRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
});

const mockItineraryAccommodationRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  updateItineraryAccommodation: jest.fn(),
});

const mockItineraryFlightRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  updateItineraryFlights: jest.fn(),
});

const mockItineraryActivityRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  updateItineraryActivities: jest.fn(),
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

describe('ItineraryService', () => {
  let itineraryService: ItineraryService;
  let itineraryAccommodationRepository,
    itineraryFlightRepository,
    itineraryActivityRepository,
    itineraryRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ItineraryService,
        {
          provide: EmailsService,
          useValue: {
            sendEmailConfirmationEmail: jest.fn(),
          },
        },
        { provide: ItineraryRepository, useFactory: mockItineraryRepository },
        {
          provide: ItineraryAccommodationRepository,
          useFactory: mockItineraryAccommodationRepository,
        },
        {
          provide: ItineraryFlightRepository,
          useFactory: mockItineraryFlightRepository,
        },
        {
          provide: ItineraryActivityRepository,
          useFactory: mockItineraryActivityRepository,
        },
      ],
    }).compile();

    itineraryService = module.get(ItineraryService);
    itineraryRepository = module.get(ItineraryRepository);
    itineraryAccommodationRepository = module.get(
      ItineraryAccommodationRepository,
    );
    itineraryFlightRepository = module.get(ItineraryFlightRepository);
    itineraryActivityRepository = module.get(ItineraryActivityRepository);
  });

  describe('Creating an Event Itinerary', () => {
    it('calls ItineraryRepository.create and returns the result', async () => {
      itineraryRepository.create.mockResolvedValue({
        completed: false,
        created_at: '2022-02-05 13:18:36.930376',
        eventId: '1fea9404-49e8-49cc-ad31-d363b911e92a',
      });

      const createItinerarySpy = jest.spyOn(
        itineraryService,
        'createEventItinerary',
      );
      await itineraryService.createEventItinerary(
        mockEventItinerary,
        mockEventOne,
      );
      expect(createItinerarySpy).toHaveBeenCalledWith(
        mockEventItinerary,
        mockEventOne,
      );
    });
  });

  describe('Get an Event Itinerary', () => {
    it('calls ItineraryRepository.findOne and returns the result', async () => {
      itineraryRepository.findOne.mockResolvedValue(mockEventItinerary);

      const getEventItinerarySpy = jest.spyOn(
        itineraryService,
        'getEventItinerary',
      );
      const result = await itineraryService.getEventItinerary(mockEventOne);
      expect(getEventItinerarySpy).toHaveBeenCalledWith(mockEventOne);
      expect(result).toEqual(mockEventItinerary);
    });
  });

  describe('Delete an Event Itinerary', () => {
    it('calls ItineraryRepository.delete and returns the result', async () => {
      itineraryRepository.delete.mockResolvedValue({ rowsAffected: 1 });

      const deleteEventItinerarySpy = jest.spyOn(
        itineraryService,
        'deleteEventItinerary',
      );
      const result = await itineraryService.deleteEventItinerary(mockEventOne);
      expect(deleteEventItinerarySpy).toHaveBeenCalledWith(mockEventOne);
      expect(result).toEqual({ rowsAffected: 1 });
    });
  });

  describe('Update an Event Itinerary', () => {
    it('calls ItineraryRepository.update and returns the result', async () => {
      itineraryRepository.findOne.mockResolvedValue(mockEventOne);

      itineraryRepository.update.mockResolvedValue(undefined);

      const updateEventItinerarySpy = jest.spyOn(
        itineraryService,
        'updateEventItinerary',
      );
      const result = await itineraryService.updateEventItinerary(
        mockEventItinerary,
        mockEventOne,
      );
      expect(updateEventItinerarySpy).toHaveBeenCalledWith(
        mockEventItinerary,
        mockEventOne,
      );
      expect(result).toEqual(undefined);
    });
  });
});
