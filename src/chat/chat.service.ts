import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../events/events.entity';
import { User } from '../users/user.entity';
import { MessageRepository } from './message.repository';

@Injectable()
export class ChatService {
  private logger: Logger = new Logger('ChatService');
  constructor(
    @InjectRepository(MessageRepository)
    private messageRepository: MessageRepository,
  ) {}

  async saveChatMessage(content: string, user: User, event: Event) {
    const newMessage = await this.messageRepository.create({
      content: content,
      event: event,
      author: user,
    });
    await this.messageRepository.save(newMessage);
    this.logger.log(`New message created - id: ${newMessage.id}`)
    return newMessage;
  }

  async deleteChatMessage(messageId: string) {
    return this.messageRepository.delete({ id: messageId });
  }

  async getEventChatMessages(event: Event) {
    const chatMessages = await this.messageRepository.find({
      relations: ['author'],
      where: { event: event },
      select: ['id', 'content', 'author', 'created_at'],
      order: { created_at: 'ASC' },
    });

    this.logger.log(`Getting event chat messages - eventId: ${event.id}`)

    return chatMessages;
  }
}
