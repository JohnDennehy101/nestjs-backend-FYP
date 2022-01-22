import { Body, Controller, Get, Post, Req, UseGuards, Param, ParseUUIDPipe, ParseEnumPipe, Patch, Delete, ParseArrayPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventDto } from './dto/event.dto'
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { EventsType } from './events-type.enums';
import { PollOptionDto } from 'src/polls/dto/polls-option.dto';
import { PollsDto } from 'src/polls/dto/polls.dto';
import { IsActivatedGuard } from 'src/users/guards/is-activated.guard';
import { ItineraryDto } from 'src/itinerary/dto/itinerary.dto';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService : EventsService) {}
    
    //@UseGuards(IsActivatedGuard)
    @Post('/:userId')
    createEvent(@Body(new PayloadValidationPipe()) eventDto : EventDto, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
        return this.eventsService.createEvent(eventDto, userId);
    }

    //@UseGuards(IsActivatedGuard)
    @Post('/:id/poll')
    createEventPoll(@Body() pollsDto : PollsDto, @Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.createEventPoll(pollsDto, eventId);
    }

    //@UseGuards(IsActivatedGuard)
    @Patch('/:id/poll/:pollId')
    updateEventPoll(@Body() pollsDto : PollsDto, @Param('pollId', new ParseUUIDPipe()) pollId: string): Promise<void> {
        return this.eventsService.updateEventPoll(pollsDto, pollId);
    }

    //@UseGuards(IsActivatedGuard)
    @Patch('/:userId/:id/poll/:pollId/vote')
    voteEventPoll(@Body() pollsDto : PollsDto, @Param('pollId', new ParseUUIDPipe()) pollId: string, @Param('id', new ParseUUIDPipe()) eventId: string, @Param('userId', new ParseUUIDPipe()) userId : string): Promise<void> {
        return this.eventsService.voteEventPoll(pollsDto, eventId, pollId, userId);
    }

    //@UseGuards(IsActivatedGuard)
    @Get('/:id/poll/:pollId')
    getEventPoll(@Param('pollId', new ParseUUIDPipe()) pollId: string): Promise<void> {
        return this.eventsService.getEventPoll(pollId);
    }

    //@UseGuards(IsActivatedGuard)
    @Delete('/:id/poll/:pollId')
    deleteEventPoll(@Param('pollId', new ParseUUIDPipe()) pollId: string): Promise<void> {
        return this.eventsService.deleteEventPoll(pollId);
    }

    //@UseGuards(IsActivatedGuard)
    @Get('/user/:userId')
    findAllUserEvents(@Param('userId', new ParseUUIDPipe()) userId: string) : Promise<Event[]> {
        return this.eventsService.findAllUserEvents(userId);
    }

    //@UseGuards(IsActivatedGuard)
    @Get('/:id')
    findEvent(@Param('id', new ParseUUIDPipe()) id: string): Promise<Event> {
        return this.eventsService.findEvent(id)
    }

    @Get('/:id/accommodation')
    returnScrapedAccommodationInformation(@Param('id', new ParseUUIDPipe()) id: string, @Query('startDate') startDate: Date, @Query('endDate') endDate: Date): Promise<any> {
        return this.eventsService.returnScrapedAccommodationInformation(id, startDate, endDate)
    }

    @Get('/:id/flights')
    returnScrapedFlightsInformation(@Param('id', new ParseUUIDPipe()) id: string, @Query('startDate') startDate: Date, @Query('endDate') endDate: Date): Promise<any> {
        return this.eventsService.returnScrapedFlightInformation(id, startDate, endDate)
    }

    //@UseGuards(IsActivatedGuard)
    @Post('/:id/itinerary')
    createEventItinerary(@Body() itineraryDto : ItineraryDto, @Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.createEventItinerary(itineraryDto, eventId);
    }

    //@UseGuards(IsActivatedGuard)
    @Get('/type/:id')
    findEventsByType(@Param('id', new ParseEnumPipe(EventsType)) id: string): Promise<Event[]> {
        return this.eventsService.findEventsByType(id)
    }

    //@UseGuards(IsActivatedGuard)
    @Patch('/:id')
    updatedEvent(@Body(new PayloadValidationPipe()) eventDto : EventDto, @Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.updateEvent(eventDto, eventId);
    }

    //@UseGuards(IsActivatedGuard)
    @Delete('/:id')
    deleteEvent(@Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.deleteEvent(eventId);
    }


    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}