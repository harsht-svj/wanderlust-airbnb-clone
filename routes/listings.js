const express = require("express");
const router = express.Router();
const multer  = require('multer')
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/expresserror.js");
const { listingSchema } = require("../schema.js");
const { reviewSchema } = require("../schema.js");
const {isLogged,isOwner}=require("../middleware.js");

const {storage}=require("../cloudconfig.js");
const upload=multer({storage});
const listingcontroller=require("../controller/listing.js");

//USING JOI:

const validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//COMPACTED ONE ROUTER.ROUTE
// router.route("/")
// .get(wrapAsync(listingcontroller.index))
// .post(validatelisting,isLogged, wrapAsync(listingcontroller.newlisting));

router.get("/", wrapAsync(listingcontroller.index));

// NEW (must be ABOVE :id route)
router.get("/new",isLogged,listingcontroller.rendernewform );

// SHOW
router.get("/:id", wrapAsync(listingcontroller.showindetail));

// CREATE
router.post("/",validatelisting,isLogged,upload.single("listing[image]"),wrapAsync(listingcontroller.newlisting));


router.get("/:id/edit", isLogged, isOwner, wrapAsync(listingcontroller.editpage));


router.put("/:id",isLogged,isOwner,validatelisting,upload.single("listing[image]"),wrapAsync(listingcontroller.edit));


router.delete("/:id",isLogged,isOwner,wrapAsync(listingcontroller.delete));

module.exports=router;
