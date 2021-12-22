import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ExternalApiRequestsModule } from './external-api-requests/external-api-requests.module';

@Module({
  imports: [
  ConfigModule.forRoot({
    isGlobal: true
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.DATABASE_USERNAME.toString(),
    password: process.env.DATABASE_PASSWORD.toString(),
    database: process.env.DATABASE_NAME.toString(),
    autoLoadEntities: true,
    synchronize: true
  }),
  UsersModule,
  AuthModule,
  EventsModule,
  ExternalApiRequestsModule,
],
  controllers: [],
  providers: [],
})

export class AppModule {}
