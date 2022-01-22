import { EntityRepository, Repository } from "typeorm";
import { ItineraryFlight } from "./itinerary.flight.entity";


@EntityRepository(ItineraryFlight)
export class ItineraryFlightRepository extends Repository<ItineraryFlight> {

}