import { CanActivate, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailsService } from '../emails/emails.service';
import { ImagesService } from '../images/images.service';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { PollsService } from '../polls/polls.service';
import { ExternalApiRequestsService } from '../external-api-requests/external-api-requests.service';
import { ItineraryService } from '../itinerary/itinerary.service';
import { ChatService } from '../chat/chat.service';
import { PollsRepository } from 'src/polls/polls.repository';
import { of } from 'rxjs';
import { EventsController } from './events.controller';
import { IsActivatedEventRequestsGuard } from '../users/guards/is-activated-event-requests.guard';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { LocalStrategy } from '../auth/local.strategy';

const mockEventsRepository = () => ({
  findAllUserCreatedEvents: jest.fn(),
  findAllUserInvitedEvents: jest.fn(),
  findOne: jest.fn(),
  findEvent: jest.fn(),
  findEventsByType: jest.fn(),
  update: jest.fn(),
  findEventUsers: jest.fn(),
  delete: jest.fn(),
  createEvent: jest.fn(),
});

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  createInvitedUser: jest.fn(),
  findUserByEmail: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  setProfileImage: jest.fn(),
});

const mockCreatedUser = {
  id: '4040403f34u3f3j03',
  email: 'test@gmail.com',
  password: '5434fe34',
  emailConfirmed: false,
  passwordProvided: false,
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
  invitedUsers: [mockCreatedUser],
};
const mockEventTwo = {
  id: '4040403f34u3f3j03',
  title: 'Test Event 2',
  type: 'DOMESTIC_OVERNIGHT',
  userEmails: ['testuser3@gmail.com', 'testuser4@gmail.com'],
  city: 'Limerick',
  departureCity: null,
  cityLatitude: -7.4,
  cityLongitude: 7.5,
  createdByUser: mockCreatedUser,
  polls: [],
  invitedUsers: [mockCreatedUser],
};

const mockPoll = {
  title: 'Test Poll',
  options: [
    {
      startDate: '2022-02-11 00:00:00',
      endDate: '2022-02-11 00:00:00',
    },
  ],
};

const mockAccessToken = {
  access_token: 'token',
};

const mockPollOption = {
  startDate: new Date('2022-02-11 00:00:00'),
  endDate: new Date('2022-02-11 00:00:00'),
};

const mockItinerary = {
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
      itinerary: {
        completed: false,
        id: '1',
        event: mockEventTwo,
        created_at: new Date('12/03/22'),
        updated_at: new Date('12/03/22'),
        accommodation: [],
        activities: [],
        flight: [],
      },
      id: '1',
      created_at: new Date('12/03/22'),
      updated_at: new Date('12/03/22'),
      flight: [],
      accommodation: [],
      activity: [],
    },
  ],
  accommodation: [],
  activities: [],
  completed: false,
  id: '1',
  created_at: new Date('12/03/22'),
  updated_at: new Date('12/03/22'),
  event: mockEventTwo,
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
      itinerary: mockItinerary,
      id: '1',
      created_at: new Date('12/03/22'),
      updated_at: new Date('12/03/22'),
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
      itinerary: mockItinerary,
      startDate: '12/12/21',
      endDate: '14/12/21',
      locationTitle: 'Cork',
      numberOfNightsAndGuests: '2 nights, 2 guests',
      numberOfRoomsRecommendedBooking: '1 Double Room',
      id: '1',
      created_at: new Date('12/03/22'),
      updated_at: new Date('12/03/22'),
    },
  ],
  activities: [
    {
      itinerary: mockItinerary,
      name: 'Opera House',
      vicinity: 'Main Street',
      rating: '8.5',
      user_ratings_total: '2000',
      mapLink: 'http://googlemaps.ie',
      placesId: '101219201029',
      id: '1',
      created_at: new Date('12/03/22'),
      updated_at: new Date('12/03/22'),
    },
  ],
  completed: false,
  id: '1',
  event: mockEventTwo,
  created_at: new Date('12/03/22'),
  updated_at: new Date('12/03/22'),
};

const mockChatMessage = {
  content: 'Test',
  event: mockEventOne,
  author: mockCreatedUser,
};

describe('EventsController', () => {
  let eventsService: EventsService;
  let eventsRepository;
  let externalApiRequestsService: ExternalApiRequestsService;
  let eventsController: EventsController;
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EventsController],
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [
        LocalStrategy,
        EventsService,
        {
          provide: AuthService,
          useValue: {
            createJwtToken: jest.fn().mockReturnValue('token'),
            generateHashedPassword: jest
              .fn()
              .mockResolvedValue('20103020329302'),
            decodeJwtToken: jest
              .fn()
              .mockResolvedValue({ email: 'test@gmail.com' }),
            validatePasswordLogin: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: EventsRepository, useFactory: mockEventsRepository },
        { provide: UsersRepository, useFactory: mockUsersRepository },
        {
          provide: EmailsService,
          useValue: {
            sendEmailConfirmationEmail: jest.fn(),
          },
        },
        {
          provide: PollsService,
          useValue: {
            createEventPoll: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve()),
            updateEventPoll: jest.fn(),
            returnIndividualPoll: jest.fn(),
            voteEventPoll: jest.fn(),
            getHighestVotedPollOptions: jest
              .fn()
              .mockResolvedValue(mockPollOption),
            getEventPoll: jest.fn(),
            deleteEventPoll: jest.fn(),
          },
        },
        {
          provide: ImagesService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createAccountsForInvitedUsers: jest.fn(),
            findOneUserByEmail: jest.fn().mockResolvedValue(mockCreatedUser),
          },
        },
        {
          provide: ExternalApiRequestsService,
          useValue: {
            getThirdPartyJwt: jest
              .fn()
              .mockReturnValue(
                of({ access_token: 'test' }).pipe((data) => data),
              ),

            getAccommodationInfo: jest
              .fn()
              .mockReturnValue(of([]).pipe((data) => data)),
            getFlightInfo: jest
              .fn()
              .mockReturnValue(of([]).pipe((data) => data)),
            getGooglePlacesInfo: jest
              .fn()
              .mockReturnValue(of([]).pipe((data) => data)),
          },
        },
        {
          provide: ItineraryService,
          useValue: {
            getEventItinerary: jest.fn().mockResolvedValue(mockItinerary),
            updateEventItinerary: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve()),
            deleteEventItinerary: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve()),
            createEventItinerary: jest
              .fn()
              .mockImplementationOnce(() => Promise.resolve()),
          },
        },
        {
          provide: ChatService,
          useValue: {
            saveChatMessage: jest.fn().mockResolvedValue(mockChatMessage),
            deleteChatMessage: jest.fn().mockResolvedValue({ rowsAffected: 1 }),
            getEventChatMessages: jest.fn().mockResolvedValue(mockChatMessage),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard())
      .useValue({ canActivate: () => true })
      .overrideGuard(IsActivatedEventRequestsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    eventsService = module.get(EventsService);
    eventsRepository = module.get(EventsRepository);
    externalApiRequestsService = module.get(ExternalApiRequestsService);
    eventsController = module.get(EventsController);
    authService = module.get(AuthService);
  });

  describe('createEvent', () => {
    it('should create an event and return the response', async () => {
      jest.spyOn(eventsService, 'createEvent').mockResolvedValue(mockEventTwo);

      const result = await eventsController.createEvent(
        mockEventOne,
        mockCreatedUser.id,
      );
      expect(result).toBeDefined();
      expect(result).toEqual(mockEventTwo);
    });
  });

  describe('createEventPoll', () => {
    it('should create a poll for an event and return the response', async () => {
      const createEventPollSpy = jest
        .spyOn(eventsService, 'createEventPoll')
        .mockResolvedValue(undefined);

      await eventsController.createEventPoll(mockPoll, mockEventOne.id);
      expect(createEventPollSpy).toHaveBeenCalledWith(
        mockPoll,
        mockEventOne.id,
      );
    });
  });

  describe('updateEventPoll', () => {
    it('should update a poll for an event and return the response', async () => {
      const updateEventPollSpy = jest
        .spyOn(eventsService, 'updateEventPoll')
        .mockResolvedValue(undefined);

      await eventsController.updateEventPoll(mockPoll, 'id');
      expect(updateEventPollSpy).toHaveBeenCalledWith(mockPoll, 'id');
    });
  });

  describe('voteEventPoll', () => {
    it('should create user votes for a poll', async () => {
      const voteEventPollSpy = jest
        .spyOn(eventsService, 'voteEventPoll')
        .mockResolvedValue(undefined);

      await eventsController.voteEventPoll(
        mockPoll,
        'pollId',
        mockEventOne.id,
        mockCreatedUser.id,
      );
      expect(voteEventPollSpy).toHaveBeenCalledWith(
        mockPoll,
        mockEventOne.id,
        'pollId',
        mockCreatedUser.id,
      );
    });
  });

  describe('getEventPoll', () => {
    it('should get an event poll by pollId', async () => {
      const getEventPollSpy = jest
        .spyOn(eventsService, 'getEventPoll')
        .mockResolvedValue(mockPoll);

      await eventsController.getEventPoll('pollId');
      expect(getEventPollSpy).toHaveBeenCalledWith('pollId');
    });
  });

  describe('deleteEventPoll', () => {
    it('should delete an event poll by pollId', async () => {
      const deleteEventPollSpy = jest
        .spyOn(eventsService, 'deleteEventPoll')
        .mockResolvedValue(undefined);

      await eventsController.deleteEventPoll('pollId');
      expect(deleteEventPollSpy).toHaveBeenCalledWith('pollId');
    });
  });

  describe('findAllUserEvents', () => {
    it('should find all user events and return them', async () => {
      const findAllUserEventsSpy = jest
        .spyOn(eventsService, 'findAllUserEvents')
        .mockResolvedValue([mockEventOne, mockEventTwo]);

      const result = await eventsController.findAllUserEvents(
        mockCreatedUser.id,
      );
      expect(findAllUserEventsSpy).toHaveBeenCalledWith(mockCreatedUser.id);

      expect(result).toEqual([mockEventOne, mockEventTwo]);
    });
  });

  describe('findEvent', () => {
    it('should find a specific event and return them', async () => {
      const findEventSpy = jest
        .spyOn(eventsService, 'findEvent')
        .mockResolvedValue(mockEventTwo);

      const result = await eventsController.findEvent(mockEventTwo.id);
      expect(findEventSpy).toHaveBeenCalledWith(mockEventTwo.id);

      expect(result).toEqual(mockEventTwo);
    });
  });

  describe('returnScrapedAccommodationInformation', () => {
    it('should send a request to Flask API for web scraping accommodation info and return result', async () => {
      const returnScrapedAccommodationInformationSpy = jest
        .spyOn(eventsService, 'returnScrapedAccommodationInformation')
        .mockResolvedValue([]);

      const result =
        await eventsController.returnScrapedAccommodationInformation(
          mockEventTwo.id,
          mockPollOption.startDate,
          mockPollOption.endDate,
        );
      expect(returnScrapedAccommodationInformationSpy).toHaveBeenCalledWith(
        mockEventTwo.id,
        mockPollOption.startDate,
        mockPollOption.endDate,
      );

      expect(result).toBeDefined();
    });
  });

  describe('returnScrapedFlightsInformation', () => {
    it('should send a request to Flask API for web scraping flight info and return result', async () => {
      const returnScrapedFlightsInformationSpy = jest
        .spyOn(eventsService, 'returnScrapedFlightInformation')
        .mockResolvedValue([]);

      const result = await eventsController.returnScrapedFlightsInformation(
        mockEventTwo.id,
        mockPollOption.startDate,
        mockPollOption.endDate,
      );
      expect(returnScrapedFlightsInformationSpy).toHaveBeenCalledWith(
        mockEventTwo.id,
        mockPollOption.startDate,
        mockPollOption.endDate,
      );

      expect(result).toBeDefined();
    });
  });

  describe('returnGooglePlacesInformation', () => {
    it('should send a request to Google Places API for local tourist attractions and return result', async () => {
      const returnGooglePlacesInformationSpy = jest
        .spyOn(eventsService, 'returnGooglePlacesInfo')
        .mockResolvedValue([]);

      const result = await eventsController.returnGooglePlacesInformation(
        mockEventTwo.id,
        mockEventTwo.cityLatitude,
        mockEventTwo.cityLongitude,
      );
      expect(returnGooglePlacesInformationSpy).toHaveBeenCalledWith(
        mockEventTwo.id,
        mockEventTwo.cityLatitude,
        mockEventTwo.cityLongitude,
      );

      expect(result).toBeDefined();
    });
  });

  describe('createEventItinerary', () => {
    it('should create an itinerary for a given event', async () => {
      const createEventItinerarySpy = jest.spyOn(
        eventsService,
        'createEventItinerary',
      );

      await eventsController.createEventItinerary(
        mockItinerary,
        mockEventOne.id,
      );
      expect(createEventItinerarySpy).toHaveBeenCalledWith(
        mockItinerary,
        mockEventOne.id,
      );
    });
  });

  describe('getEventItinerary', () => {
    it('should get an event itinerary for a given event and return result', async () => {
      const getEventItinerarySpy = jest
        .spyOn(eventsService, 'getEventItinerary')
        .mockResolvedValue(mockEventItinerary);

      const result = await eventsController.getEventItinerary(mockEventOne.id);
      expect(getEventItinerarySpy).toHaveBeenCalledWith(mockEventOne.id);
      expect(result).toEqual(mockEventItinerary);
    });
  });

  describe('deleteEventItinerary', () => {
    it('should delete an itinerary for an event', async () => {
      const deleteEventItinerarySpy = jest.spyOn(
        eventsService,
        'deleteEventItinerary',
      );

      await eventsController.deleteEventItinerary(mockEventOne.id);
      expect(deleteEventItinerarySpy).toHaveBeenCalledWith(mockEventOne.id);
    });
  });

  describe('updateEventItinerary', () => {
    it('should update an itinerary for an event', async () => {
      const updateEventItinerarySpy = jest.spyOn(
        eventsService,
        'updateEventItinerary',
      );

      await eventsController.updateEventItinerary(
        mockEventItinerary,
        mockEventOne.id,
      );
      expect(updateEventItinerarySpy).toHaveBeenCalledWith(
        mockEventItinerary,
        mockEventOne.id,
      );
    });
  });

  describe('findEventsByType', () => {
    it('should find events by a specific type', async () => {
      const findEventsByTypeSpy = jest
        .spyOn(eventsService, 'findEventsByType')
        .mockResolvedValue([mockEventTwo]);

      const result = await eventsController.findEventsByType(
        'DOMESTIC_OVERNIGHT',
      );
      expect(findEventsByTypeSpy).toHaveBeenCalledWith('DOMESTIC_OVERNIGHT');
      expect(result).toEqual([mockEventTwo]);
    });
  });

  describe('updatedEvent', () => {
    it('should update an event', async () => {
      const updateEventSpy = jest.spyOn(eventsService, 'updateEvent');

      await eventsController.updatedEvent(mockEventTwo, mockEventTwo.id);
      expect(updateEventSpy).toHaveBeenCalledWith(
        mockEventTwo,
        mockEventTwo.id,
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const deleteEventSpy = jest.spyOn(eventsService, 'deleteEvent');

      await eventsController.deleteEvent(mockEventTwo.id);
      expect(deleteEventSpy).toHaveBeenCalledWith(mockEventTwo.id);
    });
  });
});
