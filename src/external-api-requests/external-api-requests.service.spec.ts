import { HttpService } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { of } from 'rxjs';

import { ExternalApiRequestsService } from './external-api-requests.service';

const mockEventOne = {
  id: '4040403f34u3f3j03',
  title: 'Test Event',
  type: 'DOMESTIC_DAY',
  userEmails: ['testuser1@gmail.com', 'testuser2@gmail.com'],
  city: 'Cork',
  departureCity: null,
  invitedUsers: [],
  cityLatitude: 7.5,
  cityLongitude: -6.7,
  createdByUser: [],
  polls: [],
};

describe('EmailsService', () => {
  let externalApiRequestsService: ExternalApiRequestsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ExternalApiRequestsService,
        {
          provide: HttpService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue(of({ data: 'test' }).pipe((data) => data)),
            post: jest
              .fn()
              .mockReturnValue(
                of({ access_token: 'test' }).pipe((data) => data),
              ),
          },
        },
      ],
    }).compile();

    externalApiRequestsService = module.get(ExternalApiRequestsService);
  });

  describe('Getting external JWT for web scraper', () => {
    it('calls httpService.post and returns the result', async () => {
      const result = await externalApiRequestsService.getThirdPartyJwt();
      expect(result).toBeDefined();
    });
  });

  describe('Getting external Accommodation Info from web scraper', () => {
    it('calls httpService.get and returns the result', async () => {
      const result = await externalApiRequestsService.getAccommodationInfo(
        mockEventOne.city,
        new Date('12/12/12'),
        new Date('12/12/12'),
        3,
        1,
        'token',
      );
      expect(result).toBeDefined();
    });
  });

  describe('Getting external Flight Info from web scraper', () => {
    it('calls httpService.get and returns the result', async () => {
      const result = await externalApiRequestsService.getFlightInfo(
        mockEventOne.departureCity,
        mockEventOne.city,
        new Date('12/12/12'),
        new Date('12/12/12'),
        3,
        'token',
      );
      expect(result).toBeDefined();
    });
  });

  describe('Getting external Google Places Info for tourist attractions', () => {
    it('calls httpService.get and returns the result', async () => {
      const result = await externalApiRequestsService.getGooglePlacesInfo(
        mockEventOne.cityLatitude,
        mockEventOne.cityLongitude,
        'tourist_attraction',
      );
      expect(result).toBeDefined();
    });
  });
});
