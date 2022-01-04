import { Body, Controller, Get, Post, Req, UseGuards, Param, ParseUUIDPipe, ParseEnumPipe, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventDto } from './dto/event.dto'
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { EventsType } from './events-type.enums';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService : EventsService) {}
    
    @Post('/:userId')
    createEvent(@Body(new PayloadValidationPipe()) eventDto : EventDto, @Param('userId', new ParseUUIDPipe()) userId: string): Promise<void> {
        return this.eventsService.createEvent(eventDto, userId);
    }

    @Get('/user/:userId')
    findAllUserEvents(@Param('userId', new ParseUUIDPipe()) userId: string) : Promise<Event[]> {
        return this.eventsService.findAllUserEvents(userId);
    }

    @Get('/:id')
    findEvent(@Param('id', new ParseUUIDPipe()) id: string): Promise<Event> {
        return this.eventsService.findEvent(id)
    }

    @Get('/type/:id')
    findEventsByType(@Param('id', new ParseEnumPipe(EventsType)) id: string): Promise<Event[]> {
        return this.eventsService.findEventsByType(id)
    }

    @Patch('/:id')
    updatedEvent(@Body(new PayloadValidationPipe()) eventDto : EventDto, @Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.updateEvent(eventDto, eventId);
    }

    @Delete('/:id')
    deleteEvent(@Param('id', new ParseUUIDPipe()) eventId: string): Promise<void> {
        return this.eventsService.deleteEvent(eventId);
    }

    @Get('/accommodation/test')
     testing(@Req() req) {
         return this.eventsService.findAccommodationInformation()
     }

    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}