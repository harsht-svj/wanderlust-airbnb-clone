const listing=require("./models/listing.js");

const Review = require("./models/review.js");

module.exports.isLogged=(req,res,next)=>{
    if(!req.isAuthenticated()){
//just after user logged in then  user should go  to the place where he want to go before  !!!
        req.session.redirectUrl=req.originalUrl;
        req.flash("error", "you must be logged in...");
      return res.redirect("/login");
    }
    next();
}
//passport resets the value of  req.session.redirectUrl  so we are storing it in res.locals passport cant delete it 
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
      let { id } = req.params;
   let list=await listing.findById(id);
   if(!list.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You do not have access to edit this Listing ");
    return res.redirect(`/listings/${id}`);
}
 next();
}


module.exports.isAuthor=async(req,res,next)=>{
      let { id,reviewid } = req.params;
   let review=await Review.findById(reviewid);
   if(!review.author._id.equals(res.locals.currUser._id)){
    req.flash("error","You do not have access to delete this review ");
      return res.redirect(`/listings/${id}`);
}
 next();
}