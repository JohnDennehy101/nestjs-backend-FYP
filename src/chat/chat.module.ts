import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { ChatService } from './chat.service';
import { MessageRepository } from './message.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([MessageRepository,  UsersRepository ]),
 
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
