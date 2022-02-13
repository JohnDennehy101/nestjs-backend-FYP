import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { EventsService } from './events/events.service';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private eventsService: EventsService) {}

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');
  afterInit(server: Server) {
    this.logger.log('Web Socket Server Initialised');
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  async joinEventChat(
    client: Socket,
    message: { author: string; room: string; content: string },
  ) {
    await this.eventsService.addEventChatMessage(
      message.content,
      message.author,
      message.room,
    );
    this.wss.to(message.room).emit('messageToClient', message);
  }

  @SubscribeMessage('requestAllEventChatMessages')
  async requestAllEventChatMessages(client: Socket, message: { room: string }) {
    const chatMessages = await this.eventsService.getAllEventChatMessages(
      message.room,
    );
    this.wss.to(message.room).emit('allEventChatMessages', chatMessages);
  }

  @SubscribeMessage('joinChatRoom')
  handleRoomJoin(client: Socket, room: string) {
    client.join(room);
    client.emit('joinedRoom', room);
  }
}
