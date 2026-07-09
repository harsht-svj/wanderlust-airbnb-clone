// controller/booking.js

const Booking = require("../models/booking");
const Listing = require("../models/listing");

// CREATE BOOKING
module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    // Owner cannot book own listing
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own property.");
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
        req.flash("error", "Check-in cannot be in the past.");
        return res.redirect(`/listings/${id}`);
    }

    if (checkOutDate <= checkInDate) {
        req.flash("error", "Check-out must be after Check-in.");
        return res.redirect(`/listings/${id}`);
    }

    // Check overlapping bookings
    const existingBooking = await Booking.findOne({
        listing: id,
        status: "Confirmed",
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate },
    });

    if (existingBooking) {
        req.flash("error", "These dates are already booked.");
        return res.redirect(`/listings/${id}`);
    }

    // Calculate nights
 const milliseconds = checkOutDate.getTime() - checkInDate.getTime();

const nights = Math.max(
    1,
    Math.ceil(milliseconds / (1000 * 60 * 60 * 24))
);

const totalPrice = Number(listing.price) * nights;
    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
    });

    await booking.save();

    listing.bookings.push(booking._id);
    await listing.save();

  req.flash("success","Booking Confirmed Successfully!");
res.redirect(`/listings/${id}`);
};

// MY BOOKINGS
module.exports.myBookings = async (req, res) => {

    const bookings = await Booking.find({
        user: req.user._id,
        status: "Confirmed",
    })
    .populate("listing")
    .sort({ createdAt: -1 });

    res.render("bookings/index", { bookings });

};

// HOST DASHBOARD

module.exports.hostBookings = async (req, res) => {

    const listings = await Listing.find({
        owner: req.user._id,
    });

    const listingIds = listings.map(listing => listing._id);

    const bookings = await Booking.find({
        listing: { $in: listingIds },
    })
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 });

    const totalBookings = bookings.length;

    const confirmedBookings = bookings.filter(
        booking => booking.status === "Confirmed"
    ).length;

    const cancelledBookings = bookings.filter(
        booking => booking.status === "Cancelled"
    ).length;

    const upcomingBookings = bookings.filter(booking => {

        return (
            booking.status === "Confirmed" &&
            booking.checkIn > new Date()
        );

    }).length;

    const revenue = bookings
        .filter(booking => booking.status === "Confirmed")
        .reduce((total, booking) => {

            return total + booking.totalPrice;

        }, 0);

    const totalProperties = listings.length;

    res.render("bookings/host", {

        bookings,

        totalBookings,

        confirmedBookings,

        cancelledBookings,

        upcomingBookings,

        revenue,

        totalProperties,

    });

};

// CANCEL BOOKING
module.exports.cancelBooking = async (req, res) => {

    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/mybookings");
    }

    if (!booking.user.equals(req.user._id)) {
        req.flash("error", "Unauthorized.");
        return res.redirect("/bookings/mybookings");
    }

    booking.status = "Cancelled";

    await booking.save();

const listingId = booking.listing;

booking.status = "Cancelled";
await booking.save();

await Listing.findByIdAndUpdate(
    listingId,
    {
        $pull: {
            bookings: booking._id,
        },
    }
);

req.flash("success", "Booking Cancelled Successfully.");

res.redirect(`/listings/${listingId}`);

};






