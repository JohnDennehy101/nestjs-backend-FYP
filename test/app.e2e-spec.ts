import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserDto } from '../src/users/dto/user.dto';
import * as pactum from 'pactum';
import { Connection, EntityManager, getConnection, QueryRunner } from 'typeorm';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { EventsModule } from '../src/events/events.module';
import { ExternalApiRequestsModule } from '../src/external-api-requests/external-api-requests.module';
import { ChatModule } from '../src/chat/chat.module';
import { EmailsModule } from '../src/emails/emails.module';
import { ImagesModule } from '../src/images/images.module';
import { ItineraryModule } from '../src/itinerary/itinerary.module';
import { PollsOptionsModule } from '../src/polls-options/polls-options.module';
import { PollsVotesModule } from '../src/polls-votes/polls-votes.module';
import { PollsModule } from '../src/polls/polls.module';
import * as fs from 'fs';
import { EventDto } from '../src/events/dto/event.dto';
import { PollsDto } from '../src/polls/dto/polls.dto';
import { ItineraryDto } from '../src/itinerary/dto/itinerary.dto';
import * as io from 'socket.io-client';
import { EventsService } from '../src/events/events.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  const userDto: UserDto = {
    email: 'newEmail2@gmail.com',
    password: 'ReallyLongPassword403%',
  };

  const eventDto: EventDto = {
    title: 'Test Event for E2E',
    type: 'DOMESTIC_OVERNIGHT',
    userEmails: ['newEmail2@gmail.com'],
    city: 'Limerick',
    departureCity: 'N/A',
  };

  const pollDto: PollsDto = {
    title: 'Test Poll E2E',
    options: [
      {
        startDate: '2022-04-11 00:00:00',
        endDate: '2022-04-12 00:00:00',
      },
    ],
  };

  const mockEventItinerary: ItineraryDto = {
    flight: [
      {
        departureTime: '04:30',
        arrivalTime: '05:50',
        departureCity: 'Dublin',
        arrivalCity: 'London',
        airport: 'Stansted',
        duration: '1h 30 min',
        directFlight: 'Direct',
        carrier: 'Ryanair',
        pricePerPerson: '€85',
        priceTotal: '€170',
        flightUrl: 'http:skycanner.ie',
      },
    ],
    accommodation: [
      {
        title: 'Skylon',
        bookingPreviewLink: 'http:booking.com',
        bookingSiteDisplayLocationMapLink: 'http:booking.com',
        bookingSiteLink: 'http://booking.com',
        freeCancellationText: 'FREE Cancellation',
        locationDistance: '6km from centre',
        numberOfBedsRecommendedBooking: '2 beds',
        price: '€150',
        ratingScore: '8.6',
        ratingScoreCategory: 'Superb',
        reviewQuantity: '5001',
        roomTypeRecommendedBooking: 'Double Room',
        startDate: '12/12/21',
        endDate: '14/12/21',
        locationTitle: 'Cork',
        numberOfNightsAndGuests: '2 nights, 2 guests',
        numberOfRoomsRecommendedBooking: '1 Double Room',
      },
    ],
    activities: [
      {
        name: 'Opera House',
        vicinity: 'Main Street',
        rating: '8.5',
        user_ratings_total: '2000',
        mapLink: 'http://googlemaps.ie',
        placesId: '101219201029',
      },
    ],
    completed: false,
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AppModule,

        ConfigModule.forRoot({
          isGlobal: true,
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
        ChatModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();
    await app.listen(3333);

    const dbConnection = moduleFixture.get(Connection);
    const manager = moduleFixture.get(EntityManager);
    // @ts-ignore
    queryRunner = manager.queryRunner =
      dbConnection.createQueryRunner('master');

    pactum.request.setBaseUrl('https://group-activity-planning-nest.herokuapp.com/');
  });

  beforeEach(async () => {
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
  });

  afterAll(async () => {
    app.close();
  });

  describe('Users', () => {
    describe('Register', () => {
      it('should sign up a user', () => {
        return pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .expectStatus(201);
      });

      it('should throw error if existing account with email', () => {
        const existingUserDto: UserDto = {
          email: 'test@gmail.com',
          password: 'ReallyLongPassword123%',
        };

        return pactum
          .spec()
          .post('api/v1/users')
          .withBody(existingUserDto)
          .expectStatus(409);
      });

      it('should throw error if invalid payload - no password', () => {
        const invalidDto = {
          email: 'newSuperEmail@gmail.com',
        };
        return pactum
          .spec()
          .post('api/v1/users')
          .withBody(invalidDto)
          .expectStatus(400);
      });

      it('should throw error if invalid payload - no email', () => {
        const invalidDto = {
          password: 'ReallyLongPassword403%',
        };
        return pactum
          .spec()
          .post('api/v1/users')
          .withBody(invalidDto)
          .expectStatus(400);
      });
    });

    describe('Login', () => {
      it('login user if valid payload, valid JWT and email has been confirmed', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/users/login')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userDto)
          .expectStatus(201);
      });

      it('should throw error if valid payload and valid JWT but user has not confirmed email', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .expectStatus(201);
        return pactum
          .spec()
          .post('api/v1/users/login')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userDto)
          .expectStatus(403);
      });
      it('should throw error if invalid JWT provided', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .expectStatus(201);
        return pactum
          .spec()
          .post('api/v1/users/login')
          .withBody(userDto)
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        const newUserResponse = await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .expectStatus(201);
        return pactum
          .spec()
          .post('api/v1/users/login')
          .withBody(userDto)
          .expectStatus(403);
      });
    });

    describe('Get User By Id', () => {
      it('Return user record if valid id and JWT in request', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/users/$S{accountId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('Throws error if invalid id in request', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/users/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });

      it('Throws error if no JWT in request', async () => {
        return pactum
          .spec()
          .get('api/v1/users/$S{accountId}')
          .expectStatus(401);
      });
    });

    describe('Update User', () => {
      it('Updates user record if valid id, payload and JWT in request', async () => {
        const updatedDto: UserDto = {
          email: 'newEmail2@gmail.com',
          password: 'ReallyLongPassword403%2',
        };

        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/users/$S{accountId}')
          .withBody(updatedDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('Error if invalid id provided in request', async () => {
        const updatedDto: UserDto = {
          email: 'newEmail2@gmail.com',
          password: 'ReallyLongPassword403%2',
        };

        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/users/1')
          .withBody(updatedDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });

      it('Error if invalid JWT provided in request', async () => {
        const updatedDto: UserDto = {
          email: 'newEmail2@gmail.com',
          password: 'ReallyLongPassword403%2',
        };

        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/users/$S{accountId}')
          .withBody(updatedDto)
          .withHeaders({ Authorization: 'Bearer 101029190209' })
          .expectStatus(401);
      });
    });

    describe('Get User By JWT', () => {
      it('Returns user if valid JWT in request', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/users/findOne/$S{accessToken}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('Bad response if invalid JWT in request', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/users/findOne/1234')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(500);
      });
    });

    describe('Add User Profile Image', () => {
      it('Adds image if valid payload and JWT in request', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/users/$S{accountId}/image')
          .withMultiPartFormData(
            'file',
            fs.readFileSync('test/defaultUserImage.png'),
            { filename: 'defaultUserImage.png' },
          )
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);
      });
    });
  });

  describe('Events', () => {
    describe('Create Event', () => {
      it('should create Event', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);
      });

      it('invalid payload should throw error', async () => {
        const invalidEventDto: EventDto = {
          title: 'Test Event for E2E',
          type: 'DOMESTIC_OVERNIGHT',
          userEmails: ['newEmail2@gmail.com'],
          city: 'Limerick',
          departureCity: null,
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1api/v1/events/$S{accountId}')
          .withBody(invalidEventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });

      it('no JWT provided should throw error', async () => {
        const userDto: UserDto = {
          email: 'newEmail2@gmail.com',
          password: 'ReallyLongPassword403%',
        };

        const eventDto: EventDto = {
          title: 'Test Event for E2E',
          type: 'DOMESTIC_OVERNIGHT',
          userEmails: ['newEmail2@gmail.com'],
          city: 'Limerick',
          departureCity: 'N/A',
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .expectStatus(401);
      });

      it('if user has not confirmed email error should be thrown', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });
    });

    describe('Create Event Poll', () => {
      it('should create Event Poll', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);
      });

      it('should throw error if invalid payload provided', async () => {
        const invalidPollDto = {
          options: [
            {
              startDate: '2022-02-11 00:00:00',
              endDate: '2022-02-11 00:00:00',
            },
          ],
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(invalidPollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(500);
      });

      it('should throw error if user has not confirmed email', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .expectStatus(401);
      });
    });

    describe('Update Event Poll', () => {
      it('should update Event Poll', async () => {
        const updatedPollDto: PollsDto = {
          title: 'Test Poll E2E - Updated',
          options: [
            {
              startDate: '2022-02-23 00:00:00',
              endDate: '2022-02-25 00:00:00',
            },
            {
              startDate: '2022-02-13 00:00:00',
              endDate: '2022-02-14 00:00:00',
            },
          ],
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .withBody(updatedPollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(200);
      });

      it('invalid payload should throw error', async () => {
        const invalidUpdatedPollDto: PollsDto = {
          title: null,
          options: null,
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .withBody(invalidUpdatedPollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(500);
      });

      it('should throw error if invalid eventId / pollID', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/1/poll/1')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .withBody(pollDto)
          .stores('pollId', 'id')
          .expectStatus(401);
      });
    });

    describe('Vote Event Poll', () => {
      it('should add user votes in Event Poll', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{accountId}/$S{eventId}/poll/$S{pollId}/vote')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{accountId}/$S{eventId}/poll/$S{pollId}/vote')
          .withBody(pollDto)
          .expectStatus(401);
      });

      it('should throw error for unconfirmed users', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/1/1/poll/1/vote')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });
    });

    describe('Get Event Poll', () => {
      it('should return Event Poll', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .expectStatus(401);
      });

      it('invalid ID should return 404', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/poll/11')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Delete Event Poll', () => {
      it('should delete Event Poll', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}/poll/$S{pollId}')
          .expectStatus(401);
      });

      it('invalid pollID should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}/poll/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Find All User Events', () => {
      it('should return user events', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/user/$S{accountId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/user/$S{accountId}')
          .expectStatus(401);
      });

      it('if user has not confirmed email error should be thrown', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/user/$S{accountId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });
    });

    describe('Find Individual Event', () => {
      it('should return individual event', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum.spec().get('api/v1/events/$S{eventId}').expectStatus(401);
      });

      it('invalid eventId should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Return accommodation info for event', () => {
      it('should return accommodation info', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/accommodation')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withQueryParams({
            startDate: '2022-04-11 00:00:00',
            endDate: '2022-04-12 00:00:00',
          })
          .inspect()
          .expectStatus(200);
      });

      it('no JWT throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/accommodation')
          .withQueryParams({
            startDate: '2022-04-11 00:00:00',
            endDate: '2022-04-12 00:00:00',
          })
          .inspect()
          .expectStatus(401);
      });

      it('invalid query parameters throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/accommodation')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withQueryParams({
            endDates: '2022-04-12 00:00:00',
          })
          .inspect()
          .expectStatus(404);
      });
    });

    describe('Return flight info for event', () => {
      it('should return flights info for event', async () => {
        const foreignEventDto: EventDto = {
          title: 'Test Event for E2E',
          type: 'FOREIGN_OVERNIGHT',
          userEmails: ['newEmail2@gmail.com'],
          city: 'London',
          departureCity: 'Limerick',
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(foreignEventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .inspect()
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/flights')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withQueryParams({
            startDate: '2022-04-11 00:00:00',
            endDate: '2022-04-12 00:00:00',
          })
          .inspect()
          .expectStatus(200);
      });

      it('no query params should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/flights')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(500);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/flights')
          .expectStatus(401);
      });

      it('invalid eventId should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/1/flights')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Return Google Places Info for event', () => {
      it('should return Google Places info for event location', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .inspect()
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/places')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withQueryParams({
            latitude: 52.6638,
            longitude: -8.6267,
          })
          .inspect()
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .inspect()
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/places')
          .withQueryParams({
            latitude: 52.6638,
            longitude: -8.6267,
          })
          .inspect()
          .expectStatus(401);
      });

      it('no query params should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .inspect()
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/places')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(500);
      });
    });

    describe('Create Event Itinerary', () => {
      it('should create itinerary', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(201);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .expectStatus(401);
      });

      it('invalid eventId query param should throw error', async () => {
        const invalidItinerary = {
          activities: null,
          flights: null,
        };
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('api/v1/events/1/itinerary')
          .withBody(invalidItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Get Event Itinerary', () => {
      it('should get itinerary', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/itinerary')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/$S{eventId}/itinerary')
          .expectStatus(401);
      });

      it('invalid Event ID should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/1/itinerary')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Delete Event Itinerary', () => {
      it('should delete itinerary', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}/itinerary')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}/itinerary')
          .expectStatus(401);
      });

      it('invalid Event ID should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/1/itinerary')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Update Event Itinerary', () => {
      it('should update itinerary', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}/itinerary')
          .expectStatus(401);
      });

      it('invalid Event ID should throw error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{eventId}/itinerary')
          .withBody(mockEventItinerary)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/1/itinerary')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Get All Events By Type', () => {
      it('get all DOMESTIC_OVERNIGHT events', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/type/DOMESTIC_OVERNIGHT')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(200);
      });

      it('no JWT throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/type/DOMESTIC_OVERNIGHT')
          .inspect()
          .expectStatus(401);
      });

      it('invalid event type throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('api/v1/events/type/DOMESTIC')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(400);
      });
    });

    describe('Update Event', () => {
      it('update event', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(eventDto)
          .inspect()
          .expectStatus(200);
      });

      it('no JWT throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/$S{eventId}')
          .withBody(eventDto)
          .expectStatus(401);
      });

      it('invalid event id throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('api/v1/events/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(eventDto)
          .inspect()
          .expectStatus(400);
      });
    });

    describe('Delete Event', () => {
      it('delete event', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(200);
      });

      it('no JWT throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/$S{eventId}')
          .expectStatus(401);
      });

      it('invalid event id throws error', async () => {
        await pactum
          .spec()
          .post('api/v1/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('api/v1/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('api/v1/events/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .inspect()
          .expectStatus(400);
      });
    });
  });
});

describe('AppGateway (e2e)', () => {
  let app: INestApplication;
  let connectToSocketIO: (email) => any;
  let queryRunner: QueryRunner;

  const eventDto: EventDto = {
    title: 'Test Event for E2E',
    type: 'DOMESTIC_OVERNIGHT',
    userEmails: ['newEmail2@gmail.com'],
    city: 'Limerick',
    departureCity: 'N/A',
  };

  const userDto: UserDto = {
    email: 'newEmail2@gmail.com',
    password: 'ReallyLongPassword403%',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: EventsService,
          useValue: {
            findEvent: jest.fn().mockResolvedValue(eventDto),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0);

    const dbConnection = moduleFixture.get(Connection);
    const manager = moduleFixture.get(EntityManager);
    // @ts-ignore
    queryRunner = manager.queryRunner =
      dbConnection.createQueryRunner('master');
    const httpServer = app.getHttpServer();
    pactum.request.setBaseUrl(`http://127.0.0.1:${httpServer.address().port}`);
    connectToSocketIO = (email) =>
      io.connect(`http://127.0.0.1:${httpServer.address().port}`, {
        transports: ['websocket'],
        forceNew: true,
        query: {
          userEmail: email,
        },
      });
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await app.close();
  });

  describe('Connection and Disconnection', () => {
    it('should connect and disconnect', (done) => {
      const socket = connectToSocketIO('test@gmail.com');

      socket.on('connect', () => {
        socket.disconnect();
      });

      socket.on('disconnect', (reason) => {
        expect(reason).toBe('io client disconnect');
        done();
      });
      socket.on('error', done);
    });
  });

  describe('Join Chat Room', () => {
    it('should join room', (done) => {
      const socket = connectToSocketIO('test@gmail.com');

      socket.emit('joinChatRoom', {
        room: '1',
        user: 'test@gmail.com',
      });

      socket.on('userChange', (message) => {
        expect(message.onlineUsers).toHaveLength(1);
        socket.disconnect();
      });

      socket.on('disconnect', (reason) => {
        done();
      });
      socket.on('error', done);
    });
  });

  describe('Request all event chat messages', () => {
    it('should add message to chat', async () => {
      await pactum
        .spec()
        .post('api/v1/users')
        .withBody(userDto)
        .stores('accessToken', 'jwtToken')
        .stores('accountId', 'userId')
        .expectStatus(201);

      const testUser = await pactum
        .spec()
        .post('api/v1/users/confirm-email')
        .withBody({ token: '$S{accessToken}' })
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      const socket = connectToSocketIO(testUser['email']);

      const testEvent = await pactum
        .spec()
        .post('api/v1/events/$S{accountId}')
        .withBody(eventDto)
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      socket.emit('joinChatRoom', {
        room: testEvent['id'],
        user: 'test@gmail.com',
      });

      socket.emit('requestAllEventChatMessages', {
        room: testEvent['id'],
      });

      await new Promise<void>((resolve) =>
        socket.on('allEventChatMessages', (message) => {
          expect(message).toBeDefined();
          resolve();
        }),
      );
    }, 30000);
  });

  describe('Request all online users', () => {
    it('should request all online users', async () => {
      await pactum
        .spec()
        .post('api/v1/users')
        .withBody(userDto)
        .stores('accessToken', 'jwtToken')
        .stores('accountId', 'userId')
        .expectStatus(201);

      const testUser = await pactum
        .spec()
        .post('api/v1/users/confirm-email')
        .withBody({ token: '$S{accessToken}' })
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      const socket = connectToSocketIO(testUser['email']);

      const testEvent = await pactum
        .spec()
        .post('api/v1/events/$S{accountId}')
        .withBody(eventDto)
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      socket.emit('joinChatRoom', {
        room: testEvent['id'],
        user: 'test@gmail.com',
      });

      socket.emit('requestAllEventOnlineUsers', {
        room: testEvent['id'],
      });

      await new Promise<void>((resolve) =>
        socket.on('allEventOnlineUsers', (message) => {
          expect(message).toBeDefined();
          resolve();
        }),
      );
    }, 30000);
  });

  describe('Add Message In Chat Room', () => {
    it('should add message to chat', async () => {
      jest.setTimeout(30000);

      await pactum
        .spec()
        .post('api/v1/users')
        .withBody(userDto)
        .stores('accessToken', 'jwtToken')
        .stores('accountId', 'userId')
        .expectStatus(201);

      const testUser = await pactum
        .spec()
        .post('api/v1/users/confirm-email')
        .withBody({ token: '$S{accessToken}' })
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      const socket = connectToSocketIO(testUser['email']);

      const testEvent = await pactum
        .spec()
        .post('api/v1/events/$S{accountId}')
        .withBody(eventDto)
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      socket.emit('joinChatRoom', {
        room: testEvent['id'],
        user: 'test@gmail.com',
      });

      socket.emit('messageToServer', {
        room: testEvent['id'],
        author: 'test@gmail.com',
        content: 'Test Message',
      });

      await new Promise<void>((resolve) =>
        socket.on('messageToClient', (message) => {
          expect(message.author.email).toEqual('test@gmail.com');
          expect(message.room).toEqual(testEvent['id']);
          resolve();
        }),
      );
    }, 30000);
  });

  describe('Delete Message In Chat Room', () => {
    it('should remove message from chat', async () => {
      jest.setTimeout(30000);

      await pactum
        .spec()
        .post('api/v1/users')
        .withBody(userDto)
        .stores('accessToken', 'jwtToken')
        .stores('accountId', 'userId')
        .expectStatus(201);

      const testUser = await pactum
        .spec()
        .post('api/v1/users/confirm-email')
        .withBody({ token: '$S{accessToken}' })
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      const socket = connectToSocketIO(testUser['email']);

      const testEvent = await pactum
        .spec()
        .post('api/v1/events/$S{accountId}')
        .withBody(eventDto)
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .returns((data) => {
          return data.res.json;
        });

      socket.emit('joinChatRoom', {
        room: testEvent['id'],
        user: testUser['email'],
      });

      socket.emit('messageToServer', {
        room: testEvent['id'],
        author: testUser['email'],
        content: 'Test Message',
      });

      let messageId;

      await new Promise<void>((resolve) =>
        socket.on('messageToClient', (message) => {
          messageId = message.room;
          expect(message.author.email).toEqual(testUser['email']);
          expect(message.room).toEqual(testEvent['id']);

          resolve();
        }),
      );

      socket.emit('deleteChatMessage', {
        messageId: messageId,
        room: testEvent['id'],
      });

      await new Promise<void>((resolve) =>
        socket.on('chatMessageDeleted', (message) => {
          expect(message).toEqual(messageId);
          resolve();
        }),
      );
    }, 10000);
  });
});
