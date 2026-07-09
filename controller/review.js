const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.destroy=async (req, res) => {

    let { id, reviewid } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewid }
    });

    await Review.findByIdAndDelete(reviewid);
 req.flash("deleted","Review Deleted");
    res.redirect(`/listings/${id}`);
};


module.exports.createreview = async (req, res) => {

    let list = await Listing.findById(req.params.id).populate("reviews");

    // Count reviews by current user on this listing
    const userReviews = list.reviews.filter(review =>
        review.author.equals(req.user._id)
    );

    if (userReviews.length >= 3) {
        req.flash("error", "You can add a maximum of 3 reviews for this property.");
        return res.redirect(`/listings/${req.params.id}`);
    }

    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;

    await newReview.save();

    list.reviews.push(newReview._id);

    await list.save();

    req.flash("success", "New Review Created");

    res.redirect(`/listings/${req.params.id}`);
};