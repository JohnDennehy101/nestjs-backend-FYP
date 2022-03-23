import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
  ParseUUIDPipe,
  ParseEnumPipe,
  Patch,
  Delete,
  ParseArrayPipe,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventDto } from './dto/event.dto';
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { EventsType } from './events-type.enums';
import { PollOptionDto } from '../polls/dto/polls-option.dto';
import { PollsDto } from '../polls/dto/polls.dto';
import { IsActivatedGuard } from '../users/guards/is-activated.guard';
import { IsActivatedEventRequestsGuard } from '../users/guards/is-activated-event-requests.guard';
import { ItineraryDto } from '../itinerary/dto/itinerary.dto';
import { Itinerary } from '../itinerary/itinerary.entity';
import { Poll } from 'src/polls/polls.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Events")
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Post('/:userId')
  createEvent(
    @Body(new PayloadValidationPipe()) eventDto: EventDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Event> {
    return this.eventsService.createEvent(eventDto, userId);
  }

  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Post('/:id/poll')
  createEventPoll(
    @Body() pollsDto: PollsDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Poll> {
    return this.eventsService.createEventPoll(pollsDto, eventId);
  }

  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Patch('/:id/poll/:pollId')
  updateEventPoll(
    @Body() pollsDto: PollsDto,
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<Poll> {
    return this.eventsService.updateEventPoll(pollsDto, pollId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Patch('/:userId/:id/poll/:pollId/vote')
  voteEventPoll(
    @Body() pollsDto: PollsDto,
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
    @Param('id', new ParseUUIDPipe()) eventId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<void> {
    return this.eventsService.voteEventPoll(pollsDto, eventId, pollId, userId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/poll/:pollId')
  getEventPoll(
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<void> {
    return this.eventsService.getEventPoll(pollId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id/poll/:pollId')
  deleteEventPoll(
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<void> {
    return this.eventsService.deleteEventPoll(pollId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/user/:userId')
  findAllUserEvents(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Event[]> {
    return this.eventsService.findAllUserEvents(userId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id')
  findEvent(@Param('id', new ParseUUIDPipe()) id: string): Promise<Event> {
    return this.eventsService.findEvent(id);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/accommodation')
  returnScrapedAccommodationInformation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<any> {
    return this.eventsService.returnScrapedAccommodationInformation(
      id,
      startDate,
      endDate,
    );
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/flights')
  returnScrapedFlightsInformation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<any> {
    return this.eventsService.returnScrapedFlightInformation(
      id,
      startDate,
      endDate,
    );
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/places')
  returnGooglePlacesInformation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<any> {
    return this.eventsService.returnGooglePlacesInfo(id, latitude, longitude);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Post('/:id/itinerary')
  createEventItinerary(
    @Body() itineraryDto: ItineraryDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Itinerary> {
    return this.eventsService.createEventItinerary(itineraryDto, eventId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/itinerary')
  getEventItinerary(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Itinerary> {
    return this.eventsService.getEventItinerary(eventId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id/itinerary')
  deleteEventItinerary(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.deleteEventItinerary(eventId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Patch('/:id/itinerary')
  updateEventItinerary(
    @Body() itineraryDto: ItineraryDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.updateEventItinerary(itineraryDto, eventId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/type/:id')
  findEventsByType(
    @Param('id', new ParseEnumPipe(EventsType)) id: string,
  ): Promise<Event[]> {
    return this.eventsService.findEventsByType(id);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Patch('/:id')
  updatedEvent(
    @Body(new PayloadValidationPipe()) eventDto: EventDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.updateEvent(eventDto, eventId);
  }

  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id')
  deleteEvent(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.deleteEvent(eventId);
  }
}
