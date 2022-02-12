import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({cors: true})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  private logger: Logger = new Logger("AppGateway");
  afterInit(server: Server) {
    this.logger.log("Web Socket Server Initialised")
  }
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  @SubscribeMessage("messageToServer")
  joinEventChat(client: Socket, message: {sender: string, room: string, message: string}) : void {
    console.log(message)
    this.wss.to(message.room).emit("messageToClient", message)
  }

  @SubscribeMessage("joinChatRoom")
  handleRoomJoin(client: Socket, room: string ) {
    console.log(room);
    client.join(room);
    client.emit("joinedRoom", room);
  }
}
