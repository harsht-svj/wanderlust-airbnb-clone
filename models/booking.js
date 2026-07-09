const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "listing",
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    checkIn: {
        type: Date,
        required: true,
    },

    checkOut: {
        type: Date,
        required: true,
    },

    guests: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },

    totalPrice: {
        type: Number,
        required: true,
    },

    status: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed",
    }

},
{
    timestamps: true,
});

module.exports = mongoose.model("Booking", bookingSchema);