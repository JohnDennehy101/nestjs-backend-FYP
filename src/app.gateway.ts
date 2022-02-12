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
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, text: string): void {
  this.wss.emit("msgToClient", text)
  }
}
