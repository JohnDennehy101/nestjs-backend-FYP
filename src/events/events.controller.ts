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
import { Poll } from '../polls/polls.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Events')
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({
    summary: 'Creates an event',
    description:
      'If valid payload provided (and no existing event exists with provided title), new event is created',
  })
  @ApiBody({
    type: EventDto,
    description: 'Event Payload',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'string representation of user id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Event,
    status: 201,
    description: 'Event Created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Record already exists with same title',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Post('/:userId')
  createEvent(
    @Body(new PayloadValidationPipe()) eventDto: EventDto,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Event> {
    return this.eventsService.createEvent(eventDto, userId);
  }

  @ApiOperation({
    summary: 'Creates an event poll',
    description: 'If valid payload provided, new event poll is created',
  })
  @ApiBody({
    type: PollsDto,
    description: 'Poll Payload',
  })
  @ApiParam({
    name: 'eventId',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Poll,
    status: 201,
    description: 'Poll Created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Record already exists with same title',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Post('/:id/poll')
  createEventPoll(
    @Body() pollsDto: PollsDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Poll> {
    return this.eventsService.createEventPoll(pollsDto, eventId);
  }

  @ApiOperation({
    summary: 'Updates an event poll',
    description: 'If valid payload provided, event poll is updated',
  })
  @ApiBody({
    type: PollsDto,
    description: 'Poll Payload',
  })
  @ApiParam({
    name: 'pollId',
    required: true,
    description: 'string representation of poll id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Poll,
    status: 200,
    description: 'Poll Created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard(), IsActivatedEventRequestsGuard)
  @Patch('/:id/poll/:pollId')
  updateEventPoll(
    @Body() pollsDto: PollsDto,
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<Poll> {
    return this.eventsService.updateEventPoll(pollsDto, pollId);
  }

  @ApiOperation({
    summary: 'Vote in event poll',
    description:
      'If valid payload provided, poll votes are added for event poll',
  })
  @ApiBody({
    type: PollsDto,
    description: 'Poll Payload',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'string representation of user id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiParam({
    name: 'pollId',
    required: true,
    description: 'string representation of poll id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Poll Votes Created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    summary: 'Get an event poll',
    description: 'If valid pollId provided, event poll returned',
  })
  @ApiParam({
    name: 'pollId',
    required: true,
    description: 'string representation of poll id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Event poll found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/poll/:pollId')
  getEventPoll(
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<void> {
    return this.eventsService.getEventPoll(pollId);
  }

  @ApiOperation({
    summary: 'Delete event poll',
    description: 'If valid pollId provided, event poll deleted',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiParam({
    name: 'pollId',
    required: true,
    description: 'string representation of poll id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Poll Deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id/poll/:pollId')
  deleteEventPoll(
    @Param('pollId', new ParseUUIDPipe()) pollId: string,
  ): Promise<void> {
    return this.eventsService.deleteEventPoll(pollId);
  }

  @ApiOperation({
    summary: 'Get all user events',
    description:
      'If valid userId provided, return all user events (both created and invited events)',
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'string representation of user id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Event,
    isArray: true,
    status: 200,
    description: 'User events returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/user/:userId')
  findAllUserEvents(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<Event[]> {
    return this.eventsService.findAllUserEvents(userId);
  }

  @ApiOperation({
    summary: 'Get an individual event',
    description: 'If valid eventId provided, return event',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Event,
    status: 200,
    description: 'Individaul event returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id')
  findEvent(@Param('id', new ParseUUIDPipe()) id: string): Promise<Event> {
    return this.eventsService.findEvent(id);
  }

  @ApiOperation({
    summary: 'Get accommodation information for event dates',
    description:
      'If valid payload provided, return accommodation information for event',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Accommodation info returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    summary: 'Get flights information for event dates',
    description:
      'If valid payload provided, return flights information for event',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Flight info returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    summary: 'Get Google Places tourist activities for event destination',
    description:
      'If valid payload provided, tourist activities returned for event destination',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Tourist activity info returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
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

  @ApiOperation({
    summary: 'Creates an event itinerary',
    description: 'If valid payload provided, new event itinerary is created',
  })
  @ApiBody({
    type: ItineraryDto,
    description: 'Itinerary Payload',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Itinerary,
    status: 201,
    description: 'Event itinerary created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Post('/:id/itinerary')
  createEventItinerary(
    @Body() itineraryDto: ItineraryDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Itinerary> {
    return this.eventsService.createEventItinerary(itineraryDto, eventId);
  }

  @ApiOperation({
    summary: 'Get event itinerary',
    description:
      'If valid eventId provided, return event itinerary (if it exists)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Itinerary,
    status: 200,
    description: 'Event itinerary returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/:id/itinerary')
  getEventItinerary(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<Itinerary> {
    return this.eventsService.getEventItinerary(eventId);
  }

  @ApiOperation({
    summary: 'Delete event itinerary',
    description:
      'If valid eventId provided, delete event itinerary (if it exists)',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Event itinerary deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id/itinerary')
  deleteEventItinerary(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.deleteEventItinerary(eventId);
  }

  @ApiOperation({
    summary: 'Update event itinerary',
    description: 'If valid payload provided, update event itinerary',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiBody({
    type: ItineraryDto,
    description: 'Itinerary Payload',
  })
  @ApiResponse({
    status: 200,
    description: 'Event itinerary updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Patch('/:id/itinerary')
  updateEventItinerary(
    @Body() itineraryDto: ItineraryDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.updateEventItinerary(itineraryDto, eventId);
  }

  @ApiOperation({
    summary: 'Get events by type',
    description:
      'If valid event type passed as query parameter, return all events of that type',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    type: Event,
    isArray: true,
    status: 200,
    description: 'All events of queried type returned',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Get('/type/:id')
  findEventsByType(
    @Param('id', new ParseEnumPipe(EventsType)) id: string,
  ): Promise<Event[]> {
    return this.eventsService.findEventsByType(id);
  }

  @ApiOperation({
    summary: 'Update an event',
    description: 'If valid payload provided and valid eventId, update event',
  })
  @ApiBody({
    type: EventDto,
    description: 'Event Payload',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Patch('/:id')
  updatedEvent(
    @Body(new PayloadValidationPipe()) eventDto: EventDto,
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.updateEvent(eventDto, eventId);
  }

  @ApiOperation({
    summary: 'Delete an event',
    description: 'If valid eventId provided, delete event',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'string representation of event id in database',
    schema: { oneOf: [{ type: 'string' }] },
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Valid payload must be provided.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized request. Valid JWT must be provided in header.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Unauthorized request. User must confirm email before access is provided to events API routes.',
  })
  @ApiBearerAuth()
  @UseGuards(IsActivatedEventRequestsGuard)
  @UseGuards(AuthGuard())
  @Delete('/:id')
  deleteEvent(
    @Param('id', new ParseUUIDPipe()) eventId: string,
  ): Promise<void> {
    return this.eventsService.deleteEvent(eventId);
  }
}
