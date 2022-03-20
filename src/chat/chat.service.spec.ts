import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MessageRepository } from './message.repository';
import { ChatService } from './chat.service';

const mockMessageRepository = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
});

const mockUser = {
  email: 'test@gmail.com',
  password: 'somePassword123%',
};

const mockMessage = {
  id: '4040403f34u3f3j03',
  content: 'test message',
  author: {
    id: '4040403f34u3f3j03',
    email: 'test@gmail.com',
    password: '5434fe34',
    emailConfirmed: false,
    passwordProvided: false,
    profileImageUrl: null,
    createdEvents: [],
    pollVotes: [],
    invitedEvents: [],
  },
  event: {
    id: '4040403f34u3f3j03',
    title: 'Test Event 2',
    type: 'DOMESTIC_OVERNIGHT',
    userEmails: ['testuser3@gmail.com', 'testuser4@gmail.com'],
    city: 'Limerick',
    departureCity: null,
    cityLatitude: 6.7,
    cityLongitude: -7.5,
    createdByUser: {
      id: '4040403f34u3f3j03',
      email: 'test@gmail.com',
      password: '5434fe34',
      emailConfirmed: false,
      passwordProvided: false,
      profileImageUrl: null,
      createdEvents: [],
      pollVotes: [],
      invitedEvents: [],
    },
    invitedUsers: [],
    polls: [],
  },
};

describe('ChatService', () => {
  let chatService: ChatService;
  let messageRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: MessageRepository, useFactory: mockMessageRepository },
      ],
    }).compile();

    chatService = module.get(ChatService);
    messageRepository = module.get(MessageRepository);
  });

  describe('Creating a Message', () => {
    it('calls MessageRepository.create and returns the result', async () => {
      messageRepository.create.mockResolvedValue(mockMessage);
      const result = await chatService.saveChatMessage(
        mockMessage.content,
        mockMessage.author,
        mockMessage.event,
      );
      expect(result).toBeDefined();
      expect(result.content).toEqual(mockMessage.content);
    });
  });

  describe('Deleting a Message', () => {
    it('calls MessageRepository.delete and returns the result', async () => {
      messageRepository.delete.mockResolvedValue({ rowsAffected: 1 });
      const result = await chatService.deleteChatMessage(mockMessage.id);
      expect(result).toBeDefined();
    });
  });

  describe('Get Event Chat Messages', () => {
    it('calls MessageRepository.find and returns the result', async () => {
      const mockedMessagesStructure = [
        {
          content: 'test',
          id: '10101',
          author: mockMessage.author,
          event: mockMessage.event,
        },
      ];
      messageRepository.find.mockResolvedValue(mockedMessagesStructure);
      const result = await chatService.getEventChatMessages(mockMessage.event);
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
