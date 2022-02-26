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

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let queryRunner: QueryRunner;

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
        const dto: UserDto = {
          email: 'newEmail@gmail.com',
          password: 'ReallyLongPassword403%',
        };
        return pactum
          .spec()
          .post('/users')
          .withBody(dto)
          .stores('accessToken', 'jwtToken')
          .expectStatus(201);
      });

      it('should throw error if existing account with email', () => {
        const dto: UserDto = {
          email: 'test@gmail.com',
          password: 'ReallyLongPassword403%',
        };
        return pactum.spec().post('/users').withBody(dto).expectStatus(409);
      });

      it('should throw error if invalid payload - no password', () => {
        const dto = {
          email: 'newSuperEmail@gmail.com',
        };
        return pactum.spec().post('/users').withBody(dto).expectStatus(400);
      });

      it('should throw error if invalid payload - no email', () => {
        const dto = {
          password: 'ReallyLongPassword403%',
        };
        return pactum.spec().post('/users').withBody(dto).expectStatus(400);
      });
    });
  });

  describe('Login', () => {
    it('login user if valid payload, valid JWT and email has been confirmed', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum.spec().post('/users').withBody(dto).expectStatus(201);

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
        .withBody(dto)
        .expectStatus(201);
    });

    it('should throw error if valid payload and valid JWT but user has not confirmed email', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum.spec().post('/users').withBody(dto).expectStatus(201);
      return pactum
        .spec()
        .post('/users/login')
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .withBody(dto)
        .expectStatus(403);
    });
    it('should throw error if invalid JWT provided', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };
      await pactum.spec().post('/users').withBody(dto).expectStatus(201);
      return pactum.spec().post('/users/login').withBody(dto).expectStatus(403);
    });

    it('should throw error if no JWT provided', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };
      const newUserResponse = await pactum
        .spec()
        .post('/users')
        .withBody(dto)
        .expectStatus(201);
      return pactum.spec().post('/users/login').withBody(dto).expectStatus(403);
    });
  });

  describe('Get User By Id', () => {
    it('Return user record if valid id and JWT in request', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
        .stores('accountId', 'userId')
        .expectStatus(201);

      return pactum
        .spec()
        .get('/users/$S{accountId}')
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .expectStatus(200);
    });

    it('Throws error if invalid id in request', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
        .stores('accountId', 'userId')
        .expectStatus(201);

      return pactum
        .spec()
        .get('/users/1')
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .expectStatus(400);
    });

    it('Throws error if no JWT in request', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      return pactum.spec().get('/users/$S{accountId}').expectStatus(401);
    });
  });

  describe('Update User', () => {
    it('Updates user record if valid id, payload and JWT in request', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      const updatedDto: UserDto = {
        email: 'newEmail2@gmail.com',
        password: 'ReallyLongPassword403%2',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
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
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      const updatedDto: UserDto = {
        email: 'newEmail2@gmail.com',
        password: 'ReallyLongPassword403%2',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
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
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      const updatedDto: UserDto = {
        email: 'newEmail2@gmail.com',
        password: 'ReallyLongPassword403%2',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
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
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
        .stores('accountId', 'userId')
        .expectStatus(201);

      return pactum
        .spec()
        .get('/users/findOne/$S{accessToken}')
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .expectStatus(200);
    });

    it('Bad response if invalid JWT in request', async () => {
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
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
      const dto: UserDto = {
        email: 'newEmail@gmail.com',
        password: 'ReallyLongPassword403%',
      };

      const updatedDto: UserDto = {
        email: 'newEmail2@gmail.com',
        password: 'ReallyLongPassword403%2',
      };

      await pactum
        .spec()
        .post('/users')
        .withBody(dto)
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
