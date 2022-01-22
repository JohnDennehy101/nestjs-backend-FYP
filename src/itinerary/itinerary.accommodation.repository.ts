import { EntityRepository, Repository } from "typeorm";
import { ItineraryAccommodation } from "./itinerary.accommodation.entity";


@EntityRepository(ItineraryAccommodation)
export class ItineraryAccommodationRepository extends Repository<ItineraryAccommodation> {

}