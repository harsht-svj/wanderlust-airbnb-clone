const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/expresserror.js");
const { reviewSchema } = require("../schema.js");
const { isLogged,isAuthor } = require("../middleware.js");
const listing = require("../models/listing.js");

const listingcontroller=require("../controller/review.js");


const validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errormsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errormsg);
    }
    next();
};


// CREATE REVIEW
router.post("/reviews",isLogged, validatereview, wrapAsync(listingcontroller.createreview));


// DELETE REVIEW
router.delete("/reviews/:reviewid",isLogged,isAuthor,wrapAsync(listingcontroller.destroy));


module.exports = router;
