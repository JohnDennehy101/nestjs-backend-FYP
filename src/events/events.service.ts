import { Injectable, UnauthorizedException } from '@nestjs/common';
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

@Injectable()
export class EventsService {
    constructor (
        @InjectRepository(EventsRepository)
        private eventsRepository: EventsRepository,
        private usersRepository: UsersRepository,
        private usersService: UsersService,
        private pollsRepository: PollsRepository,
        private pollsService: PollsService,
        private pollsOptionsService: PollsOptionsService,
        private authService : AuthService,
        private externalApiRequestsService : ExternalApiRequestsService
    ) {}

    async createEvent(eventDto : EventDto, userId : string) : Promise<void> {
        const createEventUser = await this.usersRepository.findOne({id: userId});
        const invitedUsers = await this.usersService.createAccountsForInvitedUsers(eventDto.userEmails);
        return this.eventsRepository.createEvent(eventDto, createEventUser, invitedUsers);
    }

    async createEventPoll(pollsDto : PollsDto, eventId : string) : Promise<void> {

        const event = await this.eventsRepository.findOne({id: eventId});
  
        return this.pollsService.createEventPoll(pollsDto, event);

    }

    async findAllUserEvents(userId : string) : Promise<any> {
        const user = await this.usersRepository.findOne({id: userId});
        let userCreatedEvents = await this.eventsRepository.findAllUserCreatedEvents(user);
        let userInvitedEvents = await this.eventsRepository.findAllUserInvitedEvents(user);
    

        for (let item in userInvitedEvents) {
            if (userCreatedEvents.filter((event) => event.title === userInvitedEvents[item].title).length > 0) {
                userInvitedEvents.splice(Number(item), 1);
            }
        }

        return {
            "created": userCreatedEvents,
            "invited": userInvitedEvents
        }

    }

    async findEvent(uuid: string) : Promise<Event> {
        return this.eventsRepository.findEvent(uuid);
    }

    async findEventsByType(type: string) : Promise<Event[]> {
        return this.eventsRepository.findEventsByType(type);
    }

    async updateEvent(eventDto : EventDto, eventId : string) : Promise<any> {
        return this.eventsRepository.update(eventId, {
            ...(eventDto.title && {title: eventDto.title}),
            ...(eventDto.type && {type: eventDto.type})
        })
    }

    async updateEventPoll(pollDto : PollsDto, pollId) : Promise<any> {
        return this.pollsService.updateEventPoll(pollDto, pollId)
    }

    async voteEventPoll(pollDto : PollsDto, eventId: string, pollId : string, userId: string) : Promise<any> {
        let user = await this.usersRepository.findOne({id: userId})
        let poll = await this.pollsService.returnIndividualPoll(pollId);
        let event = await this.eventsRepository.findEventUsers(eventId);
        let pollCompletionAfterSubmission = await this.pollsService.voteEventPoll(poll, event, pollDto.options, user)

        if (pollCompletionAfterSubmission) {
            let highestPollVoteOptions = await this.pollsService.getHighestVotedPollOptions(poll);

            const externalWebScrapingJwtResponse = await lastValueFrom(this.externalApiRequestsService.getThirdPartyJwt())
            
            for (let pollOption in highestPollVoteOptions) {
                let scrapedAccommodationInfoResponse = await lastValueFrom(this.externalApiRequestsService.getAccommodationInfo('Dublin', highestPollVoteOptions[pollOption].startDate, highestPollVoteOptions[pollOption].endDate,event[0].invitedUsers.length,1, await externalWebScrapingJwtResponse.access_token))

                let accommodationInfo = await scrapedAccommodationInfoResponse.resultPages

                let pages = Object.keys(accommodationInfo);
                
                for (let page in pages) {
                    //Array of objects with accommodation info
                    //console.log(accommodationInfo[pages[page]])
            
                } 
            }

            

            

        }
    }

    async getEventPoll(pollId : string) : Promise<any> {
        return this.pollsService.getEventPoll(pollId)
    }

    async deleteEventPoll(pollId : string) : Promise<any> {
        return this.pollsService.deleteEventPoll(pollId)
    }

    async deleteEvent(uuid: string) : Promise<any> {
        return this.eventsRepository.delete({id: uuid})
    }

    async findAccommodationInformation() : Promise<any> {
        /*return this.externalApiRequestsService.getAccommodationInfo('Dublin', new Date, new Date,5,1,'')*/

        /*return this.externalApiRequestsService.getFlightInfo('Dublin', 'London', new Date, new Date, 3, '')*/
        /*return this.externalApiRequestsService.getThirdPartyJwt()*/
    }

    getExternalWebScrapingJwt() {
        return this.externalApiRequestsService.getThirdPartyJwt();
    }
}
