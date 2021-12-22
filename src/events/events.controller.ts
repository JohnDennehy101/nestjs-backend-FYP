import { Body, Controller, Get, Post, Req, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventDto } from './dto/event.dto'
import { PayloadValidationPipe } from '../common/pipes/payload-validation.pipe';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService : EventsService) {}
    
    @Post('/')
    signUp(@Body(new PayloadValidationPipe()) eventDto : EventDto): Promise<void> {
        return this.eventsService.createEvent(eventDto)
    }

    @Post('/test')
     @UseGuards(AuthGuard())
     test(@Req() req) {
         console.log(req)
     }
}