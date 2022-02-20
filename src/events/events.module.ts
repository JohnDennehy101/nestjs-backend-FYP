import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsRepository } from './events.repository';
import { PassportModule } from '@nestjs/passport';
import { ExternalApiRequestsModule } from '../external-api-requests/external-api-requests.module';
import { EmailsModule } from '../emails/emails.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../users/users.repository';
import { PollsModule } from '../polls/polls.module';
import { PollsService } from '../polls/polls.service';
import { PollsOptionsModule } from '../polls-options/polls-options.module';
import { PollsVotesModule } from '../polls-votes/polls-votes.module';
import { ItineraryModule } from '../itinerary/itinerary.module';
import { ItineraryRepository } from '../itinerary/itinerary.repository';
import { ImagesModule } from '../images/images.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([EventsRepository, UsersRepository]),
    ImagesModule,
    AuthModule,
    UsersModule,
    ExternalApiRequestsModule,
    EmailsModule,
    PollsModule,
    PollsOptionsModule,
    PollsVotesModule,
    ItineraryModule,
    ChatModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, UsersService, PollsService],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
