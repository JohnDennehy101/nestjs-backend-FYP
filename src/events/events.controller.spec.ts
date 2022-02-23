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
import {
  of,

} from 'rxjs';
import { EventsController } from './events.controller';
import { IsActivatedEventRequestsGuard } from '../users/guards/is-activated-event-requests.guard';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

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
  profileImageUrl: null,
  createdEvents: [], 
  pollVotes: [], 
  invitedEvents: []
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
  invitedUsers: [mockCreatedUser]
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

describe('EventsController', () => {
  let eventsService: EventsService;
  let eventsRepository;
  let externalApiRequestsService: ExternalApiRequestsService;
  let eventsController: EventsController;
  let authService: AuthService;
  const MockActivatedEventRequestGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    
    const module = await Test.createTestingModule({
    controllers: [EventsController],
      providers: [
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
    })
     .overrideGuard(AuthGuard()).useValue({ canActivate: () => true })
    .overrideGuard(IsActivatedEventRequestsGuard).useValue({ canActivate: () => true })
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

      const result = await eventsController.createEvent(mockEventOne, mockCreatedUser.id);
      expect(result).toBeDefined();
      expect(result).toEqual(mockEventTwo)
    });
  });
});
