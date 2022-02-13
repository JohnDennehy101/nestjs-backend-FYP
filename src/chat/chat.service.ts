import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from 'src/events/events.entity';
import { User } from 'src/users/user.entity';
import { MessageRepository } from './message.repository';

@Injectable()
export class ChatService {
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
    return newMessage;
  }

  async getEventChatMessages(event: Event) {
    //const chatMessages = await this.messageRepository.getEventChatMessages(event)
    const chatMessages = await this.messageRepository.find({ relations: ["author"], where: {event: event}, select: ["content", "author", "created_at"], order: {"created_at": "ASC"} });

    return chatMessages;
  }
}
