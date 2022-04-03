import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EmailsService } from '../emails/emails.service';
import { AuthService } from '../auth/auth.service';
import { ImagesService } from '../images/images.service';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { PollsService } from '../polls/polls.service';
import { ExternalApiRequestsService } from '../external-api-requests/external-api-requests.service';
import { ItineraryService } from '../itinerary/itinerary.service';
import { ChatService } from '../chat/chat.service';
import { PollsRepository } from '../polls/polls.repository';
import {
  EMPTY,
  finalize,
  first,
  interval,
  map,
  Observable,
  of,
  Subscriber,
  take,
} from 'rxjs';

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
  findOneOrFail: jest.fn()
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
  profileImageUrl: null,
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
  flight: [],
  accommodation: [],
  activities: [],
  completed: false,
};

const mockChatMessage = {
  content: 'Test',
  event: mockEventOne,
  author: mockCreatedUser,
};

describe('EventsService', () => {
  let eventsService: EventsService;
  let eventsRepository;
  let externalApiRequestsService: ExternalApiRequestsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
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
            //getThirdPartyJwt: jest.fn().mockResolvedValue(Observable.create(observer => observer.complete())),
            //getAccommodationInfo: jest
            //  .fn().mockReturnValue(of(true))
            //  .mockResolvedValue([{ title: 'test Accommodation' }]),
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
    }).compile();

    eventsService = module.get(EventsService);
    eventsRepository = module.get(EventsRepository);
    externalApiRequestsService = module.get(ExternalApiRequestsService);
  });

  describe('Creating an Event', () => {
    it('calls EventsRepository.createEvent and returns the result', async () => {
      eventsRepository.createEvent.mockResolvedValue(mockEventOne);
      const result = await eventsService.createEvent(
        mockEventOne,
        mockCreatedUser.id,
      );
      expect(result).toBeDefined();
      expect(result.title).toEqual(mockEventOne.title);
      expect(result.city).toEqual(mockEventOne.city);
    });
  });

  describe('Getting User Created Events', () => {
    it('calls EventsRepository.findAllUserCreatedEvents and EventsRepository.findAllUserInvitedEvents and returns the result', async () => {
      eventsRepository.findAllUserCreatedEvents.mockResolvedValue([
        mockEventOne,
      ]);
      eventsRepository.findAllUserInvitedEvents.mockResolvedValue([
        mockEventTwo,
      ]);
      const result = await eventsService.findAllUserEvents(mockCreatedUser.id);
      expect(result).toBeDefined();
      expect(result.created).toHaveLength(1);
      expect(result.invited).toHaveLength(1);
    });
  });

  describe('Getting Individual Event', () => {
    it('calls EventsRepository.findOne and returns the result', async () => {
      eventsRepository.findEvent.mockResolvedValue(mockEventOne);

      const result = await eventsService.findEvent(mockEventOne.id);

      expect(result).toBeDefined();
    });
  });

  describe('Find Events By Type', () => {
    it('calls EventsRepository.findEventsByType and returns the result', async () => {
      eventsRepository.findEventsByType.mockResolvedValue([mockEventOne]);

      const result = await eventsService.findEventsByType(mockEventOne.type);

      expect(result).toBeDefined();

      expect(result[0].title).toEqual(mockEventOne.title);
    });
  });

  describe('Update Event', () => {
    it('calls EventsRepository.update and returns the result', async () => {
      eventsRepository.update.mockResolvedValue(mockEventOne);
      eventsRepository.findOneOrFail.mockResolvedValue(mockEventOne);

      const result = await eventsService.updateEvent(
        mockEventOne,
        mockEventOne.id,
      );

      expect(result).toBeDefined();

      expect(result).toEqual(mockEventOne);
    });
  });

  describe('Delete Event', () => {
    it('calls EventsRepository.delete and deletes the event', async () => {
      eventsRepository.delete.mockResolvedValue({ rowsAffected: 1 });

      const result = await eventsService.deleteEvent(mockEventOne.id);

      expect(result).toBeDefined();

      expect(result.rowsAffected).toEqual(1);
    });
  });

  describe('Create Event Poll', () => {
    it('calls PollService.createEventPoll to create event poll for event', async () => {
      const result = await eventsService.createEventPoll(
        mockPoll,
        mockEventOne.id,
      );

      expect(result).toEqual(undefined);
    });
  });

  describe('Create Event Itinerary', () => {
    it('calls ItineraryService.createEventItinerary to create event itinerary for event', async () => {
      const result = await eventsService.createEventItinerary(
        mockItinerary,
        mockEventOne.id,
      );

      expect(result).toEqual(undefined);
    });
  });

  describe('Vote Event Poll', () => {
    it('calls ItineraryService.voteEventPoll to vote in event poll for event', async () => {
      eventsRepository.findEventUsers.mockResolvedValue(mockEventOne);
      const result = await eventsService.voteEventPoll(
        mockPoll,
        mockEventOne.id,
        '12010291029101290',
        mockCreatedUser.id,
      );

      expect(result).toEqual(undefined);
    });
  });

  describe('Get Event Itinerary', () => {
    it('calls ItineraryService.getEventItinerary to get event itinerary for event', async () => {
      const result = await eventsService.getEventItinerary(mockEventOne.id);

      expect(result).toEqual(mockItinerary);
    });
  });

  describe('Get flight information for event', () => {
    it('calls ExternalApiRequestsService.getFlightInfo to get flight info for event dates', async () => {
      await eventsRepository.findEventUsers.mockResolvedValue([mockEventOne]);
      const result = await eventsService.returnScrapedFlightInformation(
        mockEventOne.id,
        mockPollOption.startDate,
        mockPollOption.endDate,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Get accommodation information for event', () => {
    it('calls ExternalApiRequestsService.getAccommodationInfo to get accommodation info for event dates', async () => {
      //externalApiRequestsService.getThirdPartyJwt.mockReturnValue(of(true))
      await eventsRepository.findEventUsers.mockResolvedValue([mockEventOne]);
      const result = await eventsService.returnScrapedAccommodationInformation(
        mockEventOne.id,
        mockPollOption.startDate,
        mockPollOption.endDate,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Get Google Places info for event location', () => {
    it('calls ExternalApiRequestsService.getGooglePlacesInfo to get tourist attraction info info for event location', async () => {
      await eventsRepository.findEventUsers.mockResolvedValue([mockEventOne]);
      const result = await eventsService.returnGooglePlacesInfo(
        mockEventOne.id,
        6.38,
        -7.14,
      );

      expect(result).toBeDefined();
    });
  });

  describe('Delete Event Itinerary', () => {
    it('calls ItineraryService.deleteEventItinerary to get event itinerary for event', async () => {
      const result = await eventsService.deleteEventItinerary(mockEventOne.id);

      expect(result).toEqual(undefined);
    });
  });

  describe('Add Event Chat Message', () => {
    it('calls ChatService.saveChatMessage to add message for event', async () => {
      await eventsRepository.findEvent.mockResolvedValue([mockEventOne]);
      const result = await eventsService.addEventChatMessage(
        mockChatMessage.content,
        mockCreatedUser.email,
        mockEventOne.id,
      );

      expect(result).toEqual(mockChatMessage);
    });
  });

  describe('Get Event Chat Messages', () => {
    it('calls ChatService.getEventChatMessages to get messages for event', async () => {
      await eventsRepository.findEvent.mockResolvedValue([mockEventOne]);
      const result = await eventsService.getAllEventChatMessages(
        mockEventOne.id,
      );
      const event = await eventsRepository.findEvent.mockResolvedValue([
        [mockEventOne],
      ]);
      expect(result).toEqual(mockChatMessage);
    });
  });
});
