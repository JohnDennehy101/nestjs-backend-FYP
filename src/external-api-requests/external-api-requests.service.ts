import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ExternalApiRequestsService {
  constructor(private httpService: HttpService) {}
  private logger: Logger = new Logger('ExternalApiRequestsService');

  getThirdPartyJwt(): Observable<any> {
    this.logger.log('Making request for Flask API JWT')
    return this.httpService
      .post(`${process.env.WEBSCRAPE_SERVER_URL}/login`, {
        username: process.env.WEBSCRAPE_SERVER_ACCESS_USERNAME,
        password: process.env.WEBSCRAPE_SERVER_ACCESS_PASSWORD,
      })
      .pipe(map((response) => response.data));
  }

  getAccommodationInfo(
    destinationCity: string,
    startDate: Date,
    endDate: Date,
    numberOfPeople: number,
    numberOfRooms: number,
    accessToken: string,
  ): Observable<any> {
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    const paramsRequest = {
      destinationCity: destinationCity,
      startDate: startDate,
      endDate: endDate,
      numberOfPeople: numberOfPeople,
      numberOfRooms: numberOfRooms,
    };
    this.logger.log(`Get accommmodation info - destinationCity: ${destinationCity}, startDate: ${startDate}, endDate: ${endDate}, numberOfPeople: ${numberOfPeople}, numberOfRooms: ${numberOfRooms}`)
    return this.httpService
      .get(`${process.env.WEBSCRAPE_SERVER_URL}/accommodation`, {
        headers: headersRequest,
        params: paramsRequest,
      })
      .pipe(map((response) => response.data));
  }

  getFlightInfo(
    fromCity: string,
    destinationCity: string,
    startDate: Date,
    endDate: Date,
    numberOfPeople: number,
    accessToken: string,
  ): Observable<any> {
    const paramsRequest = {
      fromCity: fromCity,
      destinationCity: destinationCity,
      startDate: startDate,
      endDate: endDate,
      numberOfPeople: numberOfPeople,
    };
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };
    this.logger.log(`Get Flight Info - fromCity: ${fromCity}, destinationCity: ${destinationCity}, startDate: ${startDate}, endDate: ${endDate}, numberOfPeople: ${numberOfPeople}, accessToken: ${accessToken}`)
    return this.httpService
      .get(`${process.env.WEBSCRAPE_SERVER_URL}/flights`, {
        headers: headersRequest,
        params: paramsRequest,
      })
      .pipe(map((response) => response.data));
  }

  //types - bar, restaurant, museum, night_club, tourist_attraction
  getGooglePlacesInfo(
    latitude: number,
    longitude: number,
    type: string,
  ): Observable<any> {
    this.logger.log(`Google Places API call - latitude: ${latitude}, longitude: ${longitude}, type: ${type}`)
    return this.httpService
      .get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}%2C${longitude}&radius=1500&type=${type}&key=${process.env.GOOGLE_PLACES_API_KEY}`,
      )
      .pipe(map((response) => response.data));
  }
}
