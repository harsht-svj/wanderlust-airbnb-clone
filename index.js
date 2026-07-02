const express=require("express");
//integrate backend with env file.. #DOTENV   //never upload env file it contains crediantials
  require("dotenv").config();

console.log(process.env.CLOUD_NAME);
const app=express();
const mongoose=require("mongoose");
// const listing=require("./models/listing.js");
const methodOverride = require("method-override");
const path=require("path");
const ejsmate = require('ejs-mate');
// const wrapAsync =require("./utils/wrapasync.js");
const ExpressError =require("./utils/expresserror.js");
// const {listingSchema}=require("./schema.js");
// const {reviewSchema}=require("./schema.js");
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
// const Review=require("./models/review.js");
const LocalStrategy = require("passport-local").Strategy;
const wishlistRoute = require("./routes/wishlist");


//is used to filter the mutli part data used in image uploading 
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })


const listingRoute=require("./routes/listings.js");
const reviewRoute=require("./routes/review.js");
const userRoute=require("./routes/user.js");


const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");

const User=require("./models/user.js");

app.use(express.static("public"));
app.engine('ejs',ejsmate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));

const sessionOption={
    secret: "mysupercode",
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly: true,
    }
}

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async(req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.deleted = req.flash("deleted");
    res.locals.currUser = req.user;
    res.locals.currentPath = req.path;   // 🔥 ADD THIS

    const User = require("./models/user");

    res.locals.wishlistCount = 0;

    if (req.user) {
        const user = await User.findById(req.user._id);
        res.locals.wishlistCount = user.wishlist.length;
    }

    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/",userRoute);
app.use("/listings",listingRoute);
app.use("/listings/:id",reviewRoute);
app.use("/wishlist", wishlistRoute);




app.listen(8080,()=>{
    console.log("app is working on port");
});


main()
.then(()=>{
    console.log("connection SuccessFul");
});


async function main(){
        await mongoose.connect(process.env.MONGO_URL);
  
}

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


app.use((err,req,res,next)=>{
    let {statusCode=500,message="something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
})