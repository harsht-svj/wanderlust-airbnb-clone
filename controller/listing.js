const listing = require("../models/listing.js");

const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
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


  module.exports.showindetail=(async (req, res, next) => {
    let { id } = req.params;
    let list = await listing.findById(id).populate({path:"reviews",populate:{path:"author"}},).populate("owner");

    if (!list) {
        req.flash("deleted", "Listing you are trying to access does not exist.");
        return res.redirect("/listings");   // IMPORTANT
    }
        // console.log(list);
        let wishlist = [];

if (req.user) {
    const User = require("../models/user");
    const user = await User.findById(req.user._id);
    wishlist = user.wishlist.map(id => id.toString());
}
    res.render("show.ejs", { list,wishlist});
})


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

    // ✅ Always update text data
    let updatedListing = await listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { runValidators: true, new: true }
    );

    // ✅ Only update image if new file uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

      
        updatedListing.image = { url, filename };
        await updatedListing.save();
    }

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