import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventDto } from './dto/event.dto';
import { EventsRepository } from './events.repository';
import { AuthService } from 'src/auth/auth.service';
import { Event } from './events.entity';
import { ExternalApiRequestsService } from 'src/external-api-requests/external-api-requests.service';
import { UsersRepository } from 'src/users/users.repository';
import { PollsRepository } from 'src/polls/polls.repository';
import { PollsDto } from 'src/polls/dto/polls.dto';
import { PollsService } from 'src/polls/polls.service';
import { UsersService } from 'src/users/users.service';
import { PollsOptionsService } from 'src/polls-options/polls-options.service';
import { lastValueFrom } from 'rxjs';
import { EmailsService } from 'src/emails/emails.service';
import { ItineraryService } from 'src/itinerary/itinerary.service';
import { ItineraryDto } from 'src/itinerary/dto/itinerary.dto';
import { Itinerary } from 'src/itinerary/itinerary.entity';
import returnCityCoordinates from 'src/common/utils/locationData';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventsRepository)
    private eventsRepository: EventsRepository,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private pollsRepository: PollsRepository,
    private pollsService: PollsService,
    private pollsOptionsService: PollsOptionsService,
    private authService: AuthService,
    private externalApiRequestsService: ExternalApiRequestsService,
    private emailsService: EmailsService,
    private itineraryService: ItineraryService,
    private chatService: ChatService,
  ) {}

  async createEvent(eventDto: EventDto, userId: string): Promise<void> {
    const cityCoordinates = await returnCityCoordinates(eventDto.city);
    const createEventUser = await this.usersRepository.findOne({ id: userId });
    const invitedUsers = await this.usersService.createAccountsForInvitedUsers(
      eventDto.userEmails,
    );
    return this.eventsRepository.createEvent(
      eventDto,
      createEventUser,
      invitedUsers,
      cityCoordinates,
    );
  }

  async createEventPoll(pollsDto: PollsDto, eventId: string): Promise<void> {
    const event = await this.eventsRepository.findOne({ id: eventId });

    return this.pollsService.createEventPoll(pollsDto, event);
  }

  async createEventItinerary(
    itineraryDto: ItineraryDto,
    eventId: string,
  ): Promise<void> {
    const event = await this.eventsRepository.findOne({ id: eventId });

    return this.itineraryService.createEventItinerary(itineraryDto, event);
  }

  async getEventItinerary(eventId: string): Promise<Itinerary> {
    const event = await this.eventsRepository.findOne({ id: eventId });

    return this.itineraryService.getEventItinerary(event);
  }

  async updateEventItinerary(
    itineraryDto: ItineraryDto,
    eventId: string,
  ): Promise<void> {
    const event = await this.eventsRepository.findOne(
      { id: eventId },
      { relations: ['invitedUsers'] },
    );

    return this.itineraryService.updateEventItinerary(itineraryDto, event);
  }

  async deleteEventItinerary(eventId: string): Promise<void> {
    const event = await this.eventsRepository.findOne({ id: eventId });

    return this.itineraryService.deleteEventItinerary(event);
  }

  async findAllUserEvents(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({ id: userId });
    let userCreatedEvents =
      await this.eventsRepository.findAllUserCreatedEvents(user);
    let userInvitedEvents =
      await this.eventsRepository.findAllUserInvitedEvents(user);

    for (let item in userInvitedEvents) {
      if (
        userCreatedEvents.filter(
          (event) => event.title === userInvitedEvents[item].title,
        ).length > 0
      ) {
        userInvitedEvents.splice(Number(item), 1);
      }
    }

    return {
      created: userCreatedEvents,
      invited: userInvitedEvents,
    };
  }

  async findEvent(uuid: string): Promise<Event> {
    return this.eventsRepository.findEvent(uuid);
  }

  async findEventsByType(type: string): Promise<Event[]> {
    return this.eventsRepository.findEventsByType(type);
  }

  async updateEvent(eventDto: EventDto, eventId: string): Promise<any> {
    const cityCoordinates = await returnCityCoordinates(eventDto.city);
    return this.eventsRepository.update(eventId, {
      ...(eventDto.title && { title: eventDto.title }),
      ...(eventDto.type && { type: eventDto.type }),
      ...(eventDto.city && { city: eventDto.city }),
      ...(eventDto.departureCity && { departureCity: eventDto.departureCity }),
      ...(eventDto.city && { cityLatitude: cityCoordinates[0] }),
      ...(eventDto.city && { cityLongitude: cityCoordinates[1] }),
    });
  }

  async updateEventPoll(pollDto: PollsDto, pollId): Promise<any> {
    return this.pollsService.updateEventPoll(pollDto, pollId);
  }

  async voteEventPoll(
    pollDto: PollsDto,
    eventId: string,
    pollId: string,
    userId: string,
  ): Promise<any> {
    let user = await this.usersRepository.findOne({ id: userId });
    let poll = await this.pollsService.returnIndividualPoll(pollId);
    let event = await this.eventsRepository.findEventUsers(eventId);
    let pollCompletionAfterSubmission = await this.pollsService.voteEventPoll(
      poll,
      event,
      pollDto.options,
      user,
    );

    if (pollCompletionAfterSubmission) {
      let highestPollVoteOptions =
        await this.pollsService.getHighestVotedPollOptions(poll);

      for (let user in event[0].invitedUsers) {
        //Commenting out to save on email API calls
        //await this.emailsService.sendPollCompletionEmail(event[0].invitedUsers[user], poll,highestPollVoteOptions[0], event[0],highestPollVoteOptions[0].votes.length)
      }

      const externalWebScrapingJwtResponse = await lastValueFrom(
        this.externalApiRequestsService.getThirdPartyJwt(),
      );

      for (let pollOption in highestPollVoteOptions) {
        //Check db for existing info before scraping
        let scrapedAccommodationInfoResponse = await lastValueFrom(
          this.externalApiRequestsService.getAccommodationInfo(
            event[0].city,
            highestPollVoteOptions[pollOption].startDate,
            highestPollVoteOptions[pollOption].endDate,
            event[0].invitedUsers.length,
            1,
            await externalWebScrapingJwtResponse.access_token,
          ),
        );

        let accommodationInfo =
          await scrapedAccommodationInfoResponse.resultPages;

        if (event[0].type === 'FOREIGN_OVERNIGHT') {
          let scrapedFlightInfoResponse = await lastValueFrom(
            this.externalApiRequestsService.getFlightInfo(
              event[0].departureCity,
              event[0].city,
              highestPollVoteOptions[pollOption].startDate,
              highestPollVoteOptions[pollOption].endDate,
              event[0].invitedUsers.length,
              await externalWebScrapingJwtResponse.access_token,
            ),
          );
        }
      }
    }
  }

  async getEventPoll(pollId: string): Promise<any> {
    return this.pollsService.getEventPoll(pollId);
  }

  async deleteEventPoll(pollId: string): Promise<any> {
    return this.pollsService.deleteEventPoll(pollId);
  }

  async deleteEvent(uuid: string): Promise<any> {
    return this.eventsRepository.delete({ id: uuid });
  }

  async returnScrapedAccommodationInformation(
    eventId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    let event = await this.eventsRepository.findEventUsers(eventId);
    const externalWebScrapingJwtResponse = await lastValueFrom(
      this.externalApiRequestsService.getThirdPartyJwt(),
    );

    let scrapedAccommodationInfoResponse = await lastValueFrom(
      this.externalApiRequestsService.getAccommodationInfo(
        event[0].city,
        startDate,
        endDate,
        event[0].invitedUsers.length,
        1,
        await externalWebScrapingJwtResponse.access_token,
      ),
    );

    return scrapedAccommodationInfoResponse;
  }

  async returnScrapedFlightInformation(
    eventId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    let event = await this.eventsRepository.findEventUsers(eventId);
    const externalWebScrapingJwtResponse = await lastValueFrom(
      this.externalApiRequestsService.getThirdPartyJwt(),
    );

    let scrapedAccommodationInfoResponse = await lastValueFrom(
      this.externalApiRequestsService.getFlightInfo(
        event[0].departureCity,
        event[0].city,
        startDate,
        endDate,
        event[0].invitedUsers.length,
        await externalWebScrapingJwtResponse.access_token,
      ),
    );

    return scrapedAccommodationInfoResponse;
  }

  async returnGooglePlacesInfo(
    eventId: string,
    latitude: number,
    longitude: number,
  ): Promise<any> {
    let googlePlacesResponse = await lastValueFrom(
      this.externalApiRequestsService.getGooglePlacesInfo(
        latitude,
        longitude,
        'tourist_attraction',
      ),
    );
    return googlePlacesResponse;
  }

  async addEventChatMessage(
    content: string,
    userEmail: string,
    eventId: string,
  ) {
    const event = await this.findEvent(eventId);

    const user = await this.usersService.findOneUserByEmail(userEmail);
    return this.chatService.saveChatMessage(content, user, event[0]);
  }

  async getAllEventChatMessages(eventId: string) {
    const event = await this.findEvent(eventId);
    return this.chatService.getEventChatMessages(event[0]);
  }
}
