import { Test } from '@nestjs/testing';
import { PollsOptionsRepository } from './polls-options.repository';
import { PollsOptionsService } from '../polls-options/polls-options.service';

const mockPollsOptionsRepository = () => ({
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
  description: 'Test Description',
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

describe('PollsOptionsService', () => {
  let pollsOptionsService: PollsOptionsService;
  let pollsOptionsRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PollsOptionsService,

        {
          provide: PollsOptionsRepository,
          useFactory: mockPollsOptionsRepository,
        },
      ],
    }).compile();

    pollsOptionsService = module.get(PollsOptionsService);
    pollsOptionsRepository = module.get(PollsOptionsRepository);
  });

  describe('Creating Event Poll Options', () => {
    it('calls PollsRepository.create and returns the result', async () => {
      pollsOptionsRepository.create.mockResolvedValue(mockPollOptionTwo);
      pollsOptionsRepository.save.mockResolvedValue(mockPollOptionTwo);

      const createPollOptionsSpy = jest.spyOn(
        pollsOptionsService,
        'createPollOptions',
      );
      const result = await pollsOptionsService.createPollOptions(
        mockPollOptionTwo,
        mockPoll,
      );
      expect(createPollOptionsSpy).toHaveBeenCalledWith(
        mockPollOptionTwo,
        mockPoll,
      );
      expect(result).toEqual(mockPollOptionTwo);
    });
  });

  describe('Get Event Poll Options', () => {
    it('calls PollsRepository.find and returns the result', async () => {
      pollsOptionsRepository.find.mockResolvedValue(mockPollOptionTwo);

      const getPollOptionsSpy = jest.spyOn(
        pollsOptionsService,
        'getPollOptions',
      );
      const result = await pollsOptionsService.getPollOptions(mockPoll);
      expect(getPollOptionsSpy).toHaveBeenCalledWith(mockPoll);
      expect(result).toEqual(mockPollOptionTwo);
    });
  });

  describe('Update Event Poll Options', () => {
    it('calls PollsRepository.update and returns the result', async () => {
      pollsOptionsRepository.findOne.mockResolvedValue(mockPollOptionTwo);
      pollsOptionsRepository.update.mockResolvedValue(mockPollOptionTwo);

      const updatePollOptionsSpy = jest.spyOn(
        pollsOptionsService,
        'updatePollOptions',
      );
      const result = await pollsOptionsService.updatePollOptions(
        [mockPollOptionTwo],
        mockPoll,
        [mockPollOptionTwo],
      );
      expect(updatePollOptionsSpy).toHaveBeenCalledWith(
        [mockPollOptionTwo],
        mockPoll,
        [mockPollOptionTwo],
      );

      expect(result).toEqual([mockPollOptionTwo]);
    });
  });
});
