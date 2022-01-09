import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { PassportModule } from '@nestjs/passport';
import { ExternalApiRequestsModule } from 'src/external-api-requests/external-api-requests.module';
import { EmailsModule } from 'src/emails/emails.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { UsersRepository } from 'src/users/users.repository';
import { PollsModule } from 'src/polls/polls.module';
import { PollsService } from 'src/polls/polls.service';
import { PollsOptionsModule } from 'src/polls-options/polls-options.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt'}),
    TypeOrmModule.forFeature([EventsRepository, UsersRepository]),
    //TypeOrmModule.forFeature([UsersRepository]),
    AuthModule,
    UsersModule,
    ExternalApiRequestsModule,
    EmailsModule,
    PollsModule,
    PollsOptionsModule
  ],
  controllers: [EventsController],
  providers: [EventsService, UsersService, PollsService]
})
export class EventsModule {}
