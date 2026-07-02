const User = require("../models/user");
const listing = require("../models/listing");


module.exports.toggleWishlist = async (req, res) => {

    const user = await User.findById(req.user._id);
    const listingId = req.params.id;

    if (user.wishlist.includes(listingId)) {

        user.wishlist.pull(listingId);

        req.flash("success", "Removed from Wishlist");

    } else {

        user.wishlist.push(listingId);

        req.flash("success", "Added to Wishlist");

    }
    await user.save();
res.redirect(req.headers.referer || "/listings");
};



module.exports.showWishlist = async (req, res) => {

    const user = await User.findById(req.user._id).populate("wishlist");

    res.render("wishlist.ejs", {
        l: user.wishlist,
        category: null,
        wishlist: user.wishlist.map(item => item._id.toString()),
    });

};