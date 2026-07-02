const express = require("express");
const router = express.Router();
const User=require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport=require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const listingcontroller=require("../controller/user.js");


router.get("/signup",listingcontroller.rendersignup)

router.post("/signup",wrapasync(listingcontroller.signup));



//RENDER LOGIN FORM
router.get("/login",listingcontroller.renderlogin);


//LOGIN REQUEST
router.post("/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
listingcontroller.login);


// router.post("/login",passport.authenticate("local",{failureRedirect: '/login',failureFlash:true}),async(req,res)=>{

//     req.flash("success","Welcome back to wanderLust");
//     res.redirect("/listings");

// })

//LOGOUT
router.get("/logout",listingcontroller.logout );
module.exports = router;