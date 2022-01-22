import { EntityRepository, Repository } from "typeorm";
import { Itinerary } from "./itinerary.entity";


@EntityRepository(Itinerary)
export class ItineraryRepository extends Repository<Itinerary> {

}