import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ExternalApiRequestsModule } from './external-api-requests/external-api-requests.module';
import { EmailsModule } from './emails/emails.module';
import { PollsModule } from './polls/polls.module';
import { PollsOptionsModule } from './polls-options/polls-options.module';
import { PollsVotesModule } from './polls-votes/polls-votes.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { ImagesModule } from './images/images.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction ? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          host: configService.get('DATABASE_HOST'),
          port: 5432,
          username: configService.get('DATABASE_USERNAME'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    EventsModule,
    ExternalApiRequestsModule,
    EmailsModule,
    PollsModule,
    PollsOptionsModule,
    PollsVotesModule,
    ItineraryModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [AppGateway],
})
export class AppModule {}
