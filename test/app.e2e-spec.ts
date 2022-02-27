import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserDto } from 'src/users/dto/user.dto';
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
import { EventDto } from 'src/events/dto/event.dto';
import { PollsDto } from 'src/polls/dto/polls.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;
  const userDto: UserDto = {
    email: 'newEmail@gmail.com',
    password: 'ReallyLongPassword403%',
  };

  const eventDto: EventDto = {
    title: 'Test Event for E2E',
    type: 'DOMESTIC_OVERNIGHT',
    userEmails: ['newEmail@gmail.com'],
    city: 'Limerick',
    departureCity: 'N/A',
  };

  const pollDto: PollsDto = {
    title: 'Test Poll E2E',
    options: [
      {
        startDate: '2022-02-11 00:00:00',
        endDate: '2022-02-11 00:00:00',
      },
    ],
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

    pactum.request.setBaseUrl('http://localhost:3333');
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
          .post('/users')
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
          .post('/users')
          .withBody(existingUserDto)
          .expectStatus(409);
      });

      it('should throw error if invalid payload - no password', () => {
        const invalidDto = {
          email: 'newSuperEmail@gmail.com',
        };
        return pactum
          .spec()
          .post('/users')
          .withBody(invalidDto)
          .expectStatus(400);
      });

      it('should throw error if invalid payload - no email', () => {
        const invalidDto = {
          password: 'ReallyLongPassword403%',
        };
        return pactum
          .spec()
          .post('/users')
          .withBody(invalidDto)
          .expectStatus(400);
      });
    });

    describe('Login', () => {
      it('login user if valid payload, valid JWT and email has been confirmed', async () => {
        await pactum.spec().post('/users').withBody(userDto).expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('/users/login')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userDto)
          .expectStatus(201);
      });

      it('should throw error if valid payload and valid JWT but user has not confirmed email', async () => {
        await pactum.spec().post('/users').withBody(userDto).expectStatus(201);
        return pactum
          .spec()
          .post('/users/login')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody(userDto)
          .expectStatus(403);
      });
      it('should throw error if invalid JWT provided', async () => {
        await pactum.spec().post('/users').withBody(userDto).expectStatus(201);
        return pactum
          .spec()
          .post('/users/login')
          .withBody(userDto)
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        const newUserResponse = await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .expectStatus(201);
        return pactum
          .spec()
          .post('/users/login')
          .withBody(userDto)
          .expectStatus(403);
      });
    });

    describe('Get User By Id', () => {
      it('Return user record if valid id and JWT in request', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/users/$S{accountId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('Throws error if invalid id in request', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/users/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });

      it('Throws error if no JWT in request', async () => {
        return pactum.spec().get('/users/$S{accountId}').expectStatus(401);
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
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/users/$S{accountId}')
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
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/users/1')
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
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/users/$S{accountId}')
          .withBody(updatedDto)
          .withHeaders({ Authorization: 'Bearer 101029190209' })
          .expectStatus(401);
      });
    });

    describe('Get User By JWT', () => {
      it('Returns user if valid JWT in request', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/users/findOne/$S{accessToken}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('Bad response if invalid JWT in request', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/users/findOne/1234')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(500);
      });
    });

    describe('Add User Profile Image', () => {
      it('Adds image if valid payload and JWT in request', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/users/$S{accountId}/image')
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
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);
      });

      it('invalid payload should throw error', async () => {
        const invalidEventDto: EventDto = {
          title: 'Test Event for E2E',
          type: 'DOMESTIC_OVERNIGHT',
          userEmails: ['newEmail@gmail.com'],
          city: 'Limerick',
          departureCity: null,
        };
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(invalidEventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });

      it('no JWT provided should throw error', async () => {
        const userDto: UserDto = {
          email: 'newEmail@gmail.com',
          password: 'ReallyLongPassword403%',
        };

        const eventDto: EventDto = {
          title: 'Test Event for E2E',
          type: 'DOMESTIC_OVERNIGHT',
          userEmails: ['newEmail@gmail.com'],
          city: 'Limerick',
          departureCity: 'N/A',
        };
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .expectStatus(401);
      });

      it('if user has not confirmed email error should be thrown', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });
    });

    describe('Create Event Poll', () => {
      it('should create Event Poll', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{eventId}/poll')
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
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(invalidPollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(500);
      });

      it('should throw error if user has not confirmed email', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .post('/events/$S{eventId}/poll')
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
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/$S{eventId}/poll/$S{pollId}')
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
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/$S{eventId}/poll/$S{pollId}')
          .withBody(invalidUpdatedPollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(500);
      });

      it('should throw error if invalid eventId / pollID', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/1/poll/1')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(403);
      });

      it('should throw error if no JWT provided', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/$S{eventId}/poll/$S{pollId}')
          .withBody(pollDto)
          .stores('pollId', 'id')
          .expectStatus(401);
      });
    });

    describe('Vote Event Poll', () => {
      it('should add user votes in Event Poll', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/$S{accountId}/$S{eventId}/poll/$S{pollId}/vote')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/$S{accountId}/$S{eventId}/poll/$S{pollId}/vote')
          .withBody(pollDto)
          .expectStatus(401);
      });

      it('should throw error for unconfirmed users', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        return pactum
          .spec()
          .patch('/events/1/1/poll/1/vote')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(403);
      });
    });

    describe('Get Event Poll', () => {
      it('should return Event Poll', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/events/$S{eventId}/poll/$S{pollId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/events/$S{eventId}/poll/$S{pollId}')
          .expectStatus(401);
      });

      it('invalid ID should return 404', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .get('/events/$S{eventId}/poll/11')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    describe('Delete Event Poll', () => {
      it('should delete Event Poll', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('/events/$S{eventId}/poll/$S{pollId}')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200);
      });

      it('no JWT should throw error', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('/events/$S{eventId}/poll/$S{pollId}')
          .expectStatus(401);
      });

      it('invalid pollID should throw error', async () => {
        await pactum
          .spec()
          .post('/users')
          .withBody(userDto)
          .stores('accessToken', 'jwtToken')
          .stores('accountId', 'userId')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/users/confirm-email')
          .withBody({ token: '$S{accessToken}' })
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{accountId}')
          .withBody(eventDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('eventId', 'id')
          .expectStatus(201);

        await pactum
          .spec()
          .post('/events/$S{eventId}/poll')
          .withBody(pollDto)
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .stores('pollId', 'id')
          .expectStatus(201);

        return pactum
          .spec()
          .delete('/events/$S{eventId}/poll/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(400);
      });
    });

    ///'/:id/poll/:pollId
  });
});
