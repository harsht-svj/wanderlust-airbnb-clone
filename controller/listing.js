const listing = require("../models/listing.js");

const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
//this contains the method like forward and backward geocode;
const maptoken=process.env.MAP_TOKEN;
const geocodingclient=mbxGeocoding({accessToken:maptoken});
  const User = require("../models/user");



module.exports.index = async (req, res) => {

    const { search, category } = req.query;
    let query = {};

    if (search && search.trim() !== "") {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
        ];
    }

    if (category) {
        query.category = category;
    }

    const l = await listing.find(query);

let wishlist = [];
if (req.user) {
    const user = await User.findById(req.user._id);
    wishlist = user.wishlist.map(id => id.toString());
}

res.render("home.ejs", { 
    l,
    search,
    category,
    wishlist,
});

};

module.exports.rendernewform=(req, res) => {
    res.render("new.ejs");
}
module.exports.showindetail = async (req, res) => {

    let { id } = req.params;

    const Booking = require("../models/booking");

    let list = await listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!list) {
        req.flash("deleted", "Listing you are trying to access does not exist.");
        return res.redirect("/listings");
    }

    let wishlist = [];

    if (req.user) {
        const User = require("../models/user");
        const user = await User.findById(req.user._id);
        wishlist = user.wishlist.map(id => id.toString());
    }

    // All confirmed bookings for this listing
    const bookings = await Booking.find({
        listing: list._id,
        status: "Confirmed",
    }).select("checkIn checkOut");

    // Build a flat array of every booked date (checkIn to checkOut, both inclusive)
    const bookedDates = [];

    bookings.forEach((booking) => {
        let current = new Date(booking.checkIn);
        let end = new Date(booking.checkOut);

        while (current <= end) {
            bookedDates.push(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
        }
    });

    let myBooking = null;
    let canReview = false;

    if (req.user) {

        myBooking = await Booking.findOne({
            listing: list._id,
            user: req.user._id,
            status: "Confirmed",
        });

        if (myBooking) {

            const today = new Date();

            if (today > myBooking.checkOut) {
                canReview = true;
            }

        }

    }

    res.render("show.ejs", {
        list,
        wishlist,
        bookings,
        bookedDates,
        myBooking,
        canReview,
    });

};

module.exports.newlisting = async (req, res, next) => {

    let response = await geocodingclient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    console.log("GEO RESPONSE:", response.body.features);
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };


    newListing.geometry = response.body.features[0].geometry;

    let saved = await newListing.save();
    console.log("SAVED:", saved);

    req.flash("success", "New Listing Created");
    res.redirect("/listings");

  } 

module.exports.editpage=(async(req,res,next)=>{
         let { id } = req.params;
    let list = await listing.findById(id);
    if(!list){
        req.flash("deleted"," Listing you are trying to update does not exist");
        return res.redirect("/listings");
    }
    let originalImage=list.image.url;
   originalImage= originalImage.replace("/upload","/upload/h_300,w_250");
    res.render("edit.ejs",{list,originalImage});
});

module.exports.edit = async (req, res, next) => {
    let { id } = req.params;

    // Get old listing before updating
    let oldListing = await listing.findById(id);

    // Update text fields
    let updatedListing = await listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { runValidators: true, new: true }
    );

    // Update coordinates only if location changed
    if (oldListing.location !== req.body.listing.location) {
        const response = await geocodingclient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        }).send();

        if (response.body.features.length > 0) {
            updatedListing.geometry = response.body.features[0].geometry;
        }
    }

    // Update image only if a new one was uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        updatedListing.image = { url, filename };
    }

    // Save any changes (geometry/image)
    await updatedListing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};


module.exports.delete=(async(req,res,next)=>{

    let { id } = req.params;
    let r=await listing.findByIdAndDelete(id);
    // console.log(r);
     req.flash("deleted"," Listing Deleted");
    res.redirect("/listings");
})