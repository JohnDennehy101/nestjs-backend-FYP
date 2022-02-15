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
import { User } from './users/user.entity';
import { UsersService } from './users/users.service';

@WebSocketGateway({ cors: true })
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private eventsService: EventsService,
    private usersService: UsersService,
  ) {}

  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger('AppGateway');
  private onlineUsers: User[] = [];
  private onlineUsersSockets: {} = {};
  private roomId;
  afterInit(server: Server) {
    this.logger.log('Web Socket Server Initialised');
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const userDisconnectingEmail = this.onlineUsersSockets[client.id];
    this.onlineUsers.splice(
      this.onlineUsers.findIndex(
        (user) => user.email === userDisconnectingEmail,
      ),
      1,
    );
    delete this.onlineUsersSockets[client.id];

    console.log('LIST AFTER DELETION');
    console.log(this.onlineUsersSockets);
    this.wss
      .to(this.roomId)
      .emit('userChange', { onlineUsers: this.onlineUsers });
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);

    this.onlineUsersSockets[client.id] = client.handshake.query.userEmail;
    console.log('LIST ON ADDITION');
    console.log(this.onlineUsersSockets);
  }

  @SubscribeMessage('messageToServer')
  async joinEventChat(
    client: Socket,
    message: { author: string; room: string; content: string },
  ) {
    const messageDb = await this.eventsService.addEventChatMessage(
      message.content,
      message.author,
      message.room,
    );

    const completeMessageInfo = {
      room: message.room,
      content: message.content,
      author: {
        id: messageDb.author.id,
        email: messageDb.author.email,
        profileImageUrl: messageDb.author.profileImageUrl,
      },
      created_at: messageDb.created_at,
    };
    this.wss.to(message.room).emit('messageToClient', completeMessageInfo);
  }

  @SubscribeMessage('requestAllEventChatMessages')
  async requestAllEventChatMessages(client: Socket, message: { room: string }) {
    const chatMessages = await this.eventsService.getAllEventChatMessages(
      message.room,
    );
    this.wss.to(message.room).emit('allEventChatMessages', chatMessages);
  }

  @SubscribeMessage('joinChatRoom')
  async handleRoomJoin(
    client: Socket,
    message: { room: string; user: string },
  ) {
    client.join(message.room);

    const user = await this.usersService.findOneUserByEmail(message.user);

    this.roomId = message.room;

    const onlineUserEmails : any[] = [...new Set(Object.values(this.onlineUsersSockets))]

    for (let i = 0; i < onlineUserEmails.length; i++) {
      const user = await this.usersService.findOneUserByEmail(onlineUserEmails[i]);

      if (!this.onlineUsers.find((individualUser) => individualUser.email === user.email)) {
        this.onlineUsers.push(user);
      }
    }


    this.wss
      .to(message.room)
      .emit('userChange', { onlineUsers: this.onlineUsers });
  }

  @SubscribeMessage('deleteChatMessage')
  async handleMessageDeletion(
    client: Socket,
    message: { messageId: string; room: string },
  ) {
    const messageDb = await this.eventsService.removeEventChatMessage(
      message.messageId,
    );

    this.wss.to(message.room).emit('chatMessageDeleted', message.messageId);
  }

  @SubscribeMessage('requestAllEventOnlineUsers')
  async requestAllEventOnlineUsers(client: Socket, message: { room: string }) {
    this.wss.to(message.room).emit('allEventOnlineUsers', this.onlineUsers);
  }
}
