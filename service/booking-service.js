import BookingExtranet from "../models/booking-extranet-model.js";
import ApiError from "../exceptions/api-error.js";
import NumberExtranet from "../models/numbers-model.js";
import UsersYooking from "../models/users-yooking-model.js";
import UsersCorp from "../models/users-corp-model.js";
import {parseJSONData, parseJSONProperties} from "../utils/json-parse-object.js";


class BookingService {
    async getAllBooking() {
        const data = await BookingExtranet.findAll();
        console.log("ALL DATA BOOKING",data);
        if (!data || data.length === 0) {
            throw new ApiError.BadRequest("Нет такой брони");
        }
        return data;
    }

    async getBookingActiveToId(id) {
        const users = await UsersYooking.findOne({where: {id: id}});
        const userParse = parseJSONProperties(users.dataValues)
        const bookingList = parseJSONData(users.dataValues.bookingList);

        if (bookingList.length === 0) {
            return {success: false, message: "No book"};
        }

        let bookingArray = []
        bookingList.map(book => bookingArray.push(book.id))
        const data = await BookingExtranet.findAll({where: {id: bookingArray}})
        const dataParse = data.map(item => parseJSONProperties(item.dataValues))


        const filteredBookings = dataParse.filter(booking => {
            const parsedStatus = booking.status;
            return parsedStatus && parsedStatus.name !== "Завершено";
        });

        return {success: true, data: {user: userParse, booking: filteredBookings}};
    }

    async getBookingArchiveToEmail(email) {
        console.log("email",email);
        const filterDataByStatus = (data) => {
            return data.filter(item => {
                const parsedStatus = parseJSONData(item.status);
                if (parsedStatus && parsedStatus.name === "Завершено") {
                    return true;
                } else {
                    return false;
                }
            });
        };

        const data = await BookingExtranet.findAll({ where: { email: email } });


        if (!data || data.length === 0) {
            throw new ApiError.BadRequest("Нет такой брони");
        }

        return filterDataByStatus(data);
    }


    async getAllBookingByObject(hotelId) {
        const data = await BookingExtranet.findAll({where: {hotelId: hotelId}})
        if (!data) {
            throw new ApiError.BadRequest("Нет такой брони")
        }
        return data
    }
    async getBooking(id) {
        const data = await BookingExtranet.findOne({where: {id: id}})
        if (!data) {
            throw new ApiError.BadRequest("Нет такой брони")
        }
        return data
    }
    async createBooking(numberId, dataBooking, dataNumber, updateUser, userId) {
        try {
            await BookingExtranet.create(dataBooking);
            await NumberExtranet.update(dataNumber, {where: {id: numberId}});
            await UsersYooking.update(updateUser, {where: {id: userId}});
              console.log("Бронирование успешно создано");
            return true
        } catch (error) {
            return console.error("Ошибка при создании бронирования:", error);
            // Дополнительные действия при возникновении ошибки, например, логирование или уведомление пользователя
        }
    }
    async createBookingCorp(numberId, dataBooking, dataNumber, updateUser, userId) {
        try {
            await BookingExtranet.create(dataBooking);
            await NumberExtranet.update(dataNumber, {where: {id: numberId}});
            await UsersCorp.update(updateUser, {where: {id: userId}});
            console.log("Бронирование успешно создано");
            return true
        } catch (error) {
            return console.error("Ошибка при создании бронирования:", error);
            // Дополнительные действия при возникновении ошибки, например, логирование или уведомление пользователя
        }
    }
    async updateBooking(id, data, numberId, dataNumber) {
        try {
            await NumberExtranet.update(dataNumber, { where: { id: numberId } });
            console.log("Бронирование успешно обновлено");
            return await BookingExtranet.update(data, { where: { id: id } });
        } catch (error) {
            console.error("Ошибка при обновлении бронирования:", error);
            // Дополнительные действия при возникновении ошибки, например, логирование или уведомление пользователя
            return false; // Возвращаем false при ошибке
        }
    }
    async deleteBooking(id, dataNumber, numberId, userId, userUpdate) {
        try {
            await BookingExtranet.destroy({ where: { id: id } });
            await NumberExtranet.update(dataNumber, { where: { id: numberId } });
            await UsersYooking.update(userUpdate, { where: { id: userId } });
            await UsersCorp.update(userUpdate, { where: { id: userId } });
            // Возвращаем успешный результат
            return { success: true, message: "Booking deleted successfully." };
        } catch (error) {
            // Обрабатываем ошибку и возвращаем сообщение об ошибке
            console.error("Error deleting booking:", error);
            return { success: false, message: "Error deleting booking." };
        }
    }
}

export default new BookingService()