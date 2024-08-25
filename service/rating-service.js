import Rating from "../models/rating-model.js";
import ObjectsExtranet from "../models/objects-extranet-model.js";

class RatingService {
    async getAllRatingObject(hotelId) {
        try {
            const ratings = await Rating.findAll({where: {hotelId: hotelId}});
            return { success: true, data: ratings };
        } catch (error) {
            console.error("Error in getAllRatingObject:", error);
            return { success: false, error: "Failed to get ratings" };
        }
    }
    async checkRatingObject(userId, hotelId) {
        console.log("userId: ", userId + " " + "hotelId: ", hotelId);
        try {
            const ratings = await Rating.findAll({ where: { hotelId: `${hotelId}` } });
            console.log("ratings", ratings);

            if (!ratings || ratings.length === 0) {
                return { success: false };
            }

            const searchObject = ratings.find(obj => obj.dataValues.userId === userId);
            console.log("searchObject", searchObject);

            if (!searchObject) {
                return { success: false };
            }

            // Подсчет общего рейтинга
            const totalRatings = ratings.map(rating => ({
                cleanliness: Number(rating.cleanliness),
                mood: Number(rating.mood),
                timelyCheckIn: Number(rating.timelyCheckIn),
                priceQuality: Number(rating.priceQuality),
                photoMatch: Number(rating.photoMatch),
                qualityService: Number(rating.qualityService)
            }));

            const calculateTotalRating = (ratings) => {
                const totalRating = ratings.reduce((acc, curr) => {
                    const sum = curr.cleanliness + curr.mood + curr.timelyCheckIn + curr.priceQuality + curr.photoMatch + curr.qualityService;
                    return acc + sum;
                }, 0);

                const averageRating = totalRating / (ratings.length * 6); // 6 критериев
                const roundedRating = Math.round(averageRating * 10) / 10; // Округление до 1 знака после запятой
                return roundedRating;
            };

            const averageRating = calculateTotalRating(totalRatings);

            // Обновление рейтинга в таблице ObjectsExtranet
            await ObjectsExtranet.update({ rating: averageRating }, { where: { hotelId: hotelId } });

            return { success: true, data: searchObject };
        } catch (error) {
            console.error("Error in checkRatingObject:", error);
            return { success: false, error: "Failed to get ratings" };
        }
    }
    async getAllCityRatingObject(city) {
        try {
            const ratings = await Rating.findAll({where: {city: city}});
            return { success: true, data: ratings };
        } catch (error) {
            console.error("Error in getAllRatingObject:", error);
            return { success: false, error: "Failed to get ratings" };
        }
    }
    async createRatingObject(rating) {
        try {
            await Rating.create(rating);
            return { success: true, message: "Rating created successfully" };
        } catch (error) {
            console.error("Error in createRatingObject:", error);
            return { success: false, error: "Failed to create rating" };
        }
    }
}

export default new RatingService()


