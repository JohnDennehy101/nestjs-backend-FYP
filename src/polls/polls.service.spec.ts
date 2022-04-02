import { Test } from '@nestjs/testing';
import { PollsService } from './polls.service';
import { PollsRepository } from './polls.repository';
import { EmailsService } from '../emails/emails.service';
import { PollsOptionsService } from '../polls-options/polls-options.service';
import { PollsVotesService } from '../polls-votes/polls-votes.service';

const mockPollsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
  findPoll: jest.fn(),
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
  cityLatitude: 7.5,
  cityLongitude: -7.5,
  createdByUser: mockCreatedUser,
  polls: undefined,
};

const mockPollOption = {
  startDate: new Date('2022-02-11 00:00:00'),
  endDate: new Date('2022-02-11 00:00:00'),
  id: '2',
  votes: [],
  poll: {
    title: 'Test Poll',
    options: [
      {
        startDate: new Date('2022-02-11 00:00:00'),
        endDate: new Date('2022-02-11 00:00:00'),
      },
    ],
    id: '1',
    pollOptions: [],
    pollVote: [],
    event: mockEventOne,
    completed: false,
    created_at: new Date('2022-02-11 00:00:00'),
    updated_at: new Date('2022-02-11 00:00:00'),
  },
};

const mockPollOptionTwo = {
  startDate: new Date('2022-02-11 00:00:00'),
  endDate: new Date('2022-02-11 00:00:00'),
};

const mockPoll = {
  title: 'Test Poll',
  options: [
    {
      startDate: '2022-02-11 00:00:00',
      endDate: '2022-02-11 00:00:00',
    },
  ],
  id: '1',
  pollOptions: [mockPollOption],
  pollVote: [],
  event: mockEventOne,
  completed: false,
  created_at: new Date('2022-02-11 00:00:00'),
  updated_at: new Date('2022-02-11 00:00:00'),
};

describe('PollsService', () => {
  let pollsService: PollsService;
  let pollsRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PollsService,
        {
          provide: EmailsService,
          useValue: {
            sendEmailConfirmationEmail: jest.fn(),
          },
        },
        {
          provide: PollsOptionsService,
          useValue: {
            createPollOptions: jest.fn(),
            updatePollOptions: jest.fn(),
            getPollOptionsWithMostVotes: jest
              .fn()
              .mockResolvedValue(mockPollOption),
          },
        },
        {
          provide: PollsVotesService,
          useValue: {
            updatePollVotes: jest.fn(),
            pollCompletionCheck: jest.fn(),
          },
        },
        { provide: PollsRepository, useFactory: mockPollsRepository },
      ],
    }).compile();

    pollsService = module.get(PollsService);
    pollsRepository = module.get(PollsRepository);
  });

  describe('Creating an Event Poll', () => {
    it('calls PollsRepository.create and returns the result', async () => {
      pollsRepository.create.mockResolvedValue(mockPoll);

      pollsRepository.save.mockResolvedValue(mockPoll);

      const createPollSpy = jest.spyOn(pollsService, 'createEventPoll');
      await pollsService.createEventPoll(mockPoll, mockEventOne);
      expect(createPollSpy).toHaveBeenCalledWith(mockPoll, mockEventOne);
    });
  });

  describe('Updating an Event Poll', () => {
    it('calls PollsRepository.update and returns the result', async () => {
      pollsRepository.update.mockResolvedValue({ rowsAffected: 1 });
      pollsRepository.findPoll.mockResolvedValue(mockPoll);

      const updatePollSpy = jest.spyOn(pollsService, 'updateEventPoll');
      await pollsService.updateEventPoll(mockPoll, '1');
      expect(updatePollSpy).toHaveBeenCalledWith(mockPoll, '1');
    });
  });

  describe('Voting in an Event Poll', () => {
    it('calls methods in PollVotesService, updates PollsRepository if votes completed and returns the result', async () => {
      pollsRepository.update.mockResolvedValue({ rowsAffected: 1 });
      pollsRepository.findPoll.mockResolvedValue(mockPoll);

      const votePollSpy = jest.spyOn(pollsService, 'voteEventPoll');
      await pollsService.voteEventPoll(
        mockPoll,
        mockEventOne,
        [mockPollOptionTwo],
        mockCreatedUser,
      );
      expect(votePollSpy).toHaveBeenCalledWith(
        mockPoll,
        mockEventOne,
        [mockPollOptionTwo],
        mockCreatedUser,
      );
    });
  });

  describe('Getting Most Voted Poll Option', () => {
    it('calls methods in PollOptionsService and returns the result', async () => {
      const getHighestVotedPollOptionSpy = jest.spyOn(
        pollsService,
        'getHighestVotedPollOptions',
      );
      await pollsService.getHighestVotedPollOptions(mockPoll);
      expect(getHighestVotedPollOptionSpy).toHaveBeenCalledWith(mockPoll);
    });
  });

  describe('Deleting Event Poll', () => {
    it('calls PollsRepository.delete and returns the result', async () => {
      pollsRepository.delete.mockResolvedValue({ rowsAffected: 1 });

      const deletePollSpy = jest.spyOn(pollsService, 'deleteEventPoll');
      const result = await pollsService.deleteEventPoll(mockPoll.id);

      expect(result).toEqual({ rowsAffected: 1 });
      expect(deletePollSpy).toHaveBeenCalledWith(mockPoll.id);
    });
  });

  describe('Get Event Poll', () => {
    it('calls PollsRepository.findPoll and returns the result', async () => {
      pollsRepository.findPoll.mockResolvedValue(mockPoll);

      const getPollSpy = jest.spyOn(pollsService, 'getEventPoll');
      const result = await pollsService.getEventPoll(mockPoll.id);

      expect(result).toEqual(mockPoll);
      expect(getPollSpy).toHaveBeenCalledWith(mockPoll.id);
    });
  });

  describe('Find Individual Poll', () => {
    it('calls PollsRepository.findOne and returns the result', async () => {
      pollsRepository.findOne.mockResolvedValue(mockPoll);

      const getIndividualPollSpy = jest.spyOn(
        pollsService,
        'returnIndividualPoll',
      );
      const result = await pollsService.returnIndividualPoll(mockPoll.id);

      expect(result).toEqual(mockPoll);
      expect(getIndividualPollSpy).toHaveBeenCalledWith(mockPoll.id);
    });
  });
});
