import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios'
import { map, Observable } from 'rxjs';

@Injectable()
export class ExternalApiRequestsService {
      constructor (
        private httpService: HttpService
    ) {}

    getThirdPartyJwt(): Observable<AxiosResponse<any>> {
    return this.httpService.post(`${process.env.WEBSCRAPE_SERVER_URL}/login`, {
        "username": process.env.WEBSCRAPE_SERVER_ACCESS_USERNAME,
        "password": process.env.WEBSCRAPE_SERVER_ACCESS_PASSWORD
    }).pipe(map(response => response.data));
    }


    getAccommodationInfo(destinationCity: string, startDate: Date, endDate: Date, numberOfPeople: number, numberOfRooms: number, accessToken : string): Observable<AxiosResponse<any>> {
        const headersRequest = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
        const paramsRequest = {
            'destinationCity': destinationCity,
            'startDate': startDate,
            'endDate': endDate,
            'numberOfPeople': numberOfPeople,
            'numberOfRooms': numberOfRooms,
        }
    return this.httpService.get(`${process.env.WEBSCRAPE_SERVER_URL}/accommodation`, {headers: headersRequest, params: paramsRequest}).pipe(map(response => response.data));
    }

     

    getFlightInfo(fromCity : string, destinationCity: string, startDate: Date, endDate: Date, numberOfPeople: number, accessToken : string): Observable<AxiosResponse<any>> {
         const paramsRequest = {
            'fromCity': fromCity,
            'destinationCity': destinationCity,
            'startDate': startDate,
            'endDate': endDate,
            'numberOfPeople': numberOfPeople,
        }
        const headersRequest = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    return this.httpService.get(`${process.env.WEBSCRAPE_SERVER_URL}/flights`, {headers: headersRequest, params: paramsRequest}).pipe(map(response => response.data));
    }
}