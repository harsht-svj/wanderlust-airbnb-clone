const express = require("express");
const router = express.Router();

const wishlistController = require("../controller/wishlist");
const { isLogged } = require("../middleware");

router.post("/:id", isLogged, wishlistController.toggleWishlist);

router.get("/", isLogged, wishlistController.showWishlist);

module.exports = router;

