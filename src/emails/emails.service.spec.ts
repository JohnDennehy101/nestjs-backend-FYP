import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MailgunService } from '@nextnm/nestjs-mailgun';
import { AuthService } from '../auth/auth.service';
import { EmailsService } from './emails.service';

const mockUserOne = {
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
  description: 'Test Description',
  type: 'DOMESTIC_DAY',
  userEmails: ['testuser1@gmail.com', 'testuser2@gmail.com'],
  city: 'Cork',
  departureCity: null,
  invitedUsers: [],
  cityLatitude: 7.5,
  cityLongitude: -6.7,
  createdByUser: mockUserOne,
  polls: [],
};

const mockPoll = {
  title: 'Test Poll',
  options: [
    {
      startDate: new Date('2022-02-11 00:00:00'),
      endDate: new Date('2022-02-11 00:00:00'),
    },
  ],
  id: '1010',
  pollOptions: [],
  pollVote: [],
  event: mockEventOne,
  completed: false,
  created_at: new Date('2022-02-11 00:00:00'),
  updated_at: new Date('2022-02-11 00:00:00'),
};

const mockPollOption = {
  startDate: new Date('2022-02-11 00:00:00'),
  endDate: new Date('2022-02-11 00:00:00'),
  id: 'test',
  votes: [],
  poll: mockPoll,
};

describe('EmailsService', () => {
  let emailsService: EmailsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmailsService,
        {
          provide: MailgunService,
          useValue: {
            createEmail: jest.fn().mockResolvedValue('success'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            createJwtToken: jest.fn().mockResolvedValue('token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockResolvedValue('emailUrl'),
          },
        },
      ],
    }).compile();

    emailsService = module.get(EmailsService);
  });

  describe('Sending Email Confirmation Email', () => {
    it('calls MailgunService.createEmail and returns the result', async () => {
      const result = await emailsService.sendEmailConfirmationEmail(
        'test@gmail.com',
      );
      expect(result).toBeDefined();
    });
  });

  describe('Sending Poll Completion Email', () => {
    it('calls MailgunService.createEmail and returns the result', async () => {
      const result = await emailsService.sendPollCompletionEmail(
        mockUserOne,
        mockPoll,
        mockPollOption,
        mockEventOne,
        3,
      );
      expect(result).toBeDefined();
    });
  });

  describe('Sending Poll Link Email', () => {
    it('calls MailgunService.createEmail and returns the result', async () => {
      const result = await emailsService.sendPollLinkEmail(
        mockUserOne.email,
        mockEventOne.title,
        mockUserOne.email,
        'link',
      );
      expect(result).toBeDefined();
    });
  });

  describe('Sending Completed Itinerary Email', () => {
    it('calls MailgunService.createEmail and returns the result', async () => {
      const result = await emailsService.sendCompletedItineraryEmail(
        mockEventOne.title,
        mockUserOne.email,
        [],
        [],
      );
      expect(result).toBeDefined();
    });
  });
});
