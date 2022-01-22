import { EntityRepository, Repository } from "typeorm";
import { ItineraryFlightDto } from "./dto/itinerary.flight.dto";
import { Itinerary } from "./itinerary.entity";
import { ItineraryFlight } from "./itinerary.flight.entity";


@EntityRepository(ItineraryFlight)
export class ItineraryFlightRepository extends Repository<ItineraryFlight> {
    async updateItineraryFlights (flights: ItineraryFlightDto[], itinerary: Itinerary) : Promise<void> {
    let previousFlights = await this.find({itinerary: itinerary})

    for (let item in previousFlights) {
        if (flights.filter((individualFlight) => individualFlight.airport === previousFlights[item].airport || individualFlight.carrier === previousFlights[item].carrier || individualFlight.duration === previousFlights[item].duration).length === 0) {
            await this.delete({id: previousFlights[item].id})
        }
    }

    for (let item in flights) {

        let existingRecordCheck = await this.find({departureTime: flights[item].departureTime, arrivalTime: flights[item].arrivalTime, airport: flights[item].airport, itinerary: itinerary })

        if (existingRecordCheck.length > 0) {

                await this.update(existingRecordCheck[0].id, {
            ...(flights[item].departureTime && {departureTime: flights[item].departureTime}),
            ...(flights[item].arrivalTime && {arrivalTime: flights[item].arrivalTime}),
            ...(flights[item].departureCity && {departureCity: flights[item].departureCity}),
            ...(flights[item].arrivalCity && {arrivalCity: flights[item].arrivalCity}),
            ...(flights[item].airport && {airport: flights[item].airport}),
            ...(flights[item].duration && {duration: flights[item].duration}),
            ...(flights[item].directFlight && {directFlight: flights[item].directFlight}),
            ...(flights[item].carrier && {carrier: flights[item].carrier}),
            ...(flights[item].pricePerPerson && {pricePerPerson: flights[item].pricePerPerson}),
            ...(flights[item].priceTotal && {priceTotal: flights[item].priceTotal}),
            ...(flights[item].flightUrl && {flightUrl: flights[item].flightUrl})
        })
            

             

        }
        else {
            const flightDbEntry = await this.create({
                departureTime: flights[item].departureTime,
                arrivalTime: flights[item].arrivalTime,
                departureCity: flights[item].departureCity,
                arrivalCity: flights[item].arrivalCity,
                airport: flights[item].airport,
                duration: flights[item].duration,
                directFlight: flights[item].directFlight,
                carrier: flights[item].carrier,
                pricePerPerson: flights[item].pricePerPerson,
                priceTotal: flights[item].priceTotal,
                flightUrl: flights[item].flightUrl,
                itinerary: itinerary
        })

        await this.save(flightDbEntry);
    }
    }
    
}
}