import { EntityRepository, Repository } from 'typeorm';
import { ItineraryActivityDto } from './dto/itinerary.activity.dto';
import { ItineraryActivity } from './itinerary.activity.entity';
import { Itinerary } from './itinerary.entity';

@EntityRepository(ItineraryActivity)
export class ItineraryActivityRepository extends Repository<ItineraryActivity> {
  async updateItineraryActivities(
    activities: ItineraryActivityDto[],
    itinerary: Itinerary,
  ) {
    let previousActivities = await this.find({ itinerary: itinerary });

    for (let item in previousActivities) {
      if (
        activities.filter(
          (individualActivity) =>
            individualActivity.name === previousActivities[item].name,
        ).length === 0
      ) {
        await this.delete({ id: previousActivities[item].id });
      }
    }

    for (let item in activities) {
      let existingRecordCheck = await this.find({
        name: activities[item].name,
      });

      if (existingRecordCheck.length > 0) {
        await this.update(existingRecordCheck[0].id, {
          ...(activities[item].name && { name: activities[item].name }),
          ...(activities[item].vicinity && {
            vicinity: activities[item].vicinity,
          }),
          ...(activities[item].rating && { rating: activities[item].rating }),
          ...(activities[item].user_ratings_total && {
            user_ratings_total: activities[item].user_ratings_total,
          }),
          ...(activities[item].mapLink && {
            mapLink: activities[item].mapLink,
          }),
          ...(activities[item].placesId && {
            placesId: activities[item].placesId,
          }),
        });
      } else {
        const activitiesDbEntry = await this.create({
          name: activities[item].name,
          vicinity: activities[item].vicinity,
          rating: activities[item].rating,
          user_ratings_total: activities[item].user_ratings_total,
          mapLink: activities[item].mapLink,
          placesId: activities[item].placesId,
        });

        await this.save(activitiesDbEntry);
      }
    }
  }
}
