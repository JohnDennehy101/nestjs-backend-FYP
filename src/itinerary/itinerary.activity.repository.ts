import { EntityRepository, Repository } from "typeorm";
import { ItineraryAccommodationDto } from "./dto/itinerary.accommodation.dto";
import { ItineraryAccommodation } from "./itinerary.accommodation.entity";
import { ItineraryActivity } from "./itinerary.activity.entity";
import { Itinerary } from "./itinerary.entity";


@EntityRepository(ItineraryActivity)
export class ItineraryActivityRepository extends Repository<ItineraryActivity> {


}
