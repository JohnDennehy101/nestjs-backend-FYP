import { Test } from '@nestjs/testing';
import { PollsVotesRepository } from './polls-votes.repository';
import { PollsVotesService } from './polls-votes.service';

const mockPollsVotesRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
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
  startDate: '2022-02-11 00:00:00',
  endDate: '2022-02-11 00:00:00',
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

describe('PollsVotesService', () => {
  let pollsVotesService: PollsVotesService;
  let pollsVotesRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PollsVotesService,

        {
          provide: PollsVotesRepository,
          useFactory: mockPollsVotesRepository,
        },
      ],
    }).compile();

    pollsVotesService = module.get(PollsVotesService);
    pollsVotesRepository = module.get(PollsVotesRepository);
  });

  describe('Creating Event Poll Votes', () => {
    it('calls PollsRepository.update and delete if vote no longer exists (e.g. user has updated votes)', async () => {
      pollsVotesRepository.find.mockResolvedValue([mockPoll.pollVote]);
      pollsVotesRepository.findOne.mockResolvedValue(mockPoll.pollVote);
      const createPollVotesSpy = jest.spyOn(
        pollsVotesService,
        'updatePollVotes',
      );
      await pollsVotesService.updatePollVotes(
        mockPoll,
        [mockPollOption],
        mockCreatedUser,
      );
      expect(createPollVotesSpy).toHaveBeenCalledWith(
        mockPoll,
        [mockPollOption],
        mockCreatedUser,
      );
    });
  });

  describe('Checking if all event users have voted in a poll', () => {
    it('calls PollsRepository.find to check if all users have voted', async () => {
      pollsVotesRepository.find.mockResolvedValue(mockPoll.pollVote);
      const checkAllUsersPollVotesSpy = jest.spyOn(
        pollsVotesService,
        'pollCompletionCheck',
      );
      await pollsVotesService.pollCompletionCheck(mockPoll, [mockCreatedUser]);
      expect(checkAllUsersPollVotesSpy).toHaveBeenCalledWith(mockPoll, [
        mockCreatedUser,
      ]);
    });
  });
});
