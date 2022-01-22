import { EntityRepository, Repository } from "typeorm";
import { ItineraryAccommodationDto } from "./dto/itinerary.accommodation.dto";
import { ItineraryAccommodation } from "./itinerary.accommodation.entity";
import { Itinerary } from "./itinerary.entity";


@EntityRepository(ItineraryAccommodation)
export class ItineraryAccommodationRepository extends Repository<ItineraryAccommodation> {
async updateItineraryAccommodation (accommodation: ItineraryAccommodationDto[], itinerary: Itinerary) : Promise<void> {
    let previousAccommodation = await this.find({itinerary: itinerary})

     for (let item in previousAccommodation) {
        if (accommodation.filter((individualAccommodation) => individualAccommodation.title === previousAccommodation[item].title || individualAccommodation.price === previousAccommodation[item].price || individualAccommodation.reviewQuantity === previousAccommodation[item].reviewQuantity).length === 0) {
            await this.delete({id: previousAccommodation[item].id})
        }
    }


    for (let item in accommodation) {

        let existingRecordCheck = await this.find({title: accommodation[item].title})

        if (existingRecordCheck.length > 0) {

             await this.update(existingRecordCheck[0].id, {
            ...(accommodation[item].title && {title: accommodation[item].title}),
            ...(accommodation[item].bookingPreviewLink && {bookingPreviewLink: accommodation[item].bookingPreviewLink}),
            ...(accommodation[item].bookingSiteDisplayLocationMapLink && {bookingSiteDisplayLocationMapLink: accommodation[item].bookingSiteDisplayLocationMapLink}),
            ...(accommodation[item].bookingSiteLink && {bookingSiteLink: accommodation[item].bookingSiteLink}),
            ...(accommodation[item].freeCancellationText && {freeCancellationText: accommodation[item].freeCancellationText}),
            ...(accommodation[item].locationDistance && {locationDistance: accommodation[item].locationDistance}),
            ...(accommodation[item].numberOfBedsRecommendedBooking && {numberOfBedsRecommendedBooking: accommodation[item].numberOfBedsRecommendedBooking}),
            ...(accommodation[item].price && {price: accommodation[item].price}),
            ...(accommodation[item].ratingScore && {ratingScore: accommodation[item].ratingScore}),
            ...(accommodation[item].ratingScoreCategory && {ratingScoreCategory: accommodation[item].ratingScoreCategory}),
            ...(accommodation[item].reviewQuantity && {reviewQuantity: accommodation[item].reviewQuantity}),
            ...(accommodation[item].roomTypeRecommendedBooking && {roomTypeRecommendedBooking: accommodation[item].roomTypeRecommendedBooking})
        })

        }
        else {
            
            const accommodationDbEntry = await this.create({
                title: accommodation[item].title,
                bookingPreviewLink: accommodation[item].bookingPreviewLink,
                bookingSiteDisplayLocationMapLink: accommodation[item].bookingSiteDisplayLocationMapLink,
                bookingSiteLink: accommodation[item].bookingSiteLink,
                freeCancellationText: accommodation[item].freeCancellationText,
                locationDistance: accommodation[item].locationDistance,
                numberOfBedsRecommendedBooking: accommodation[item].numberOfBedsRecommendedBooking,
                price: accommodation[item].price,
                ratingScore: accommodation[item].ratingScore,
                ratingScoreCategory: accommodation[item].ratingScoreCategory,
                reviewQuantity: accommodation[item].reviewQuantity,
                roomTypeRecommendedBooking: accommodation[item].roomTypeRecommendedBooking,
                itinerary: itinerary
            })

            await this.save(accommodationDbEntry);
        }
    }


}
}