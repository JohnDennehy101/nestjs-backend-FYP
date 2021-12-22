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


    getAccommodationInfo(accessToken : string): Observable<AxiosResponse<any>> {
        const headersRequest = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }
    return this.httpService.get(`${process.env.WEBSCRAPE_SERVER_URL}/accommodation`, {headers: headersRequest}).pipe(map(response => response.data));
  }
}
