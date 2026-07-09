// routes/booking.js

const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapasync");
const bookingController = require("../controller/booking");
const { isLogged } = require("../middleware");

// Create Booking
router.post(
    "/:id",
    isLogged,
    wrapAsync(bookingController.createBooking)
);

// My Bookings
router.get(
    "/mybookings",
    isLogged,
    wrapAsync(bookingController.myBookings)
);

// Host Dashboard
router.get(
    "/host/bookings",
    isLogged,
    wrapAsync(bookingController.hostBookings)
);

// Cancel Booking
router.delete(
    "/:bookingId",
    isLogged,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;