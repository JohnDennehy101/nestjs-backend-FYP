import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '@nextnm/nestjs-mailgun';
import { AuthService } from '../auth/auth.service';
import { Event } from '../events/events.entity';
import { ItineraryAccommodationDto } from '../itinerary/dto/itinerary.accommodation.dto';
import { ItineraryFlightDto } from '../itinerary/dto/itinerary.flight.dto';
import { PollOption } from '../polls-options/polls-options.entity';
import { Poll } from '../polls/polls.entity';
import { User } from '../users/user.entity';

@Injectable()
export class EmailsService {
   

    constructor(
        private mailgunService: MailgunService,
        private  authService: AuthService,
        private configService: ConfigService
        ) {}

    async sendEmailConfirmationEmail(email: string) : Promise<any> {
       const jwtToken = await this.authService.createJwtToken(email);
       const validationUrl = `${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${jwtToken}`

       console.log(validationUrl);

        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Confirmation Email`,
            template: 'confirm-email-template',
            'h:X-Mailgun-Variables': JSON.stringify({
            validationUrl
    }),

    };

    /*try {
        const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);
        return response;
    } catch (error) {
        console.log(error)
    } */
    console.log("Commenting out to save on email API calls")
  
    }

    async sendPollCompletionEmail(user: User, poll: Poll, pollOption: PollOption, fullEvent: Event, votes: number) : Promise<any> {
       const pollLink  = `http://localhost:8080/event/${user.id}/${fullEvent.id}/poll/${poll.id}`
       const mostVotedPollOption = `${pollOption.startDate} - ${pollOption.endDate}`;
       const event = fullEvent.title;
       const numberOfVotes = votes;

       const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${user.email}`,
            subject: `Poll Completion Email`,
            template: 'poll-completed-email',
            'h:X-Mailgun-Variables': JSON.stringify({
            pollLink,
            mostVotedPollOption,
            event,
            numberOfVotes
    }),

    };

    try {
        const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);
        return response;
    } catch (error) {
        console.log(error)
    }
  
    }

    async sendPollLinkEmail(email: string, eventName: string, pollCreatedBy: string, pollLink: string) : Promise<any> {
        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Poll Invite - ${eventName}`,
            template: 'poll-invite-email',
            'h:X-Mailgun-Variables': JSON.stringify({
            eventName,
            pollCreatedBy,
            pollLink
    }),

    };

    try {
    const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);

 
    return response;
    } catch (error) {
        console.log(error)
    }
  
    }

     async sendCompletedItineraryEmail(eventName: string, email: string, accommodation: ItineraryAccommodationDto[],  flights: ItineraryFlightDto[]) : Promise<any> {
         let flightBookingLink;

        if (flights.length > 0) {
            flightBookingLink = flights[0].flightUrl
        }
     
        const mailgunData = {
            from: 'contact@mg.groupactivityplanning.software',
            to: `${email}`,
            subject: `Event Itinerary - ${eventName}`,
            template: 'event-itinerary-email',
            'h:X-Mailgun-Variables': JSON.stringify({
            accommodation,
            flights,
            flightBookingLink
    }),
    };


    try {
    const response = await this.mailgunService.createEmail('mg.groupactivityplanning.software',mailgunData);

 
    return response;
    } catch (error) {
        console.log(error)
    }
  
    }
}
