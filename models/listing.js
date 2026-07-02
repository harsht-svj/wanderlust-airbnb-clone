const mongoose=require("mongoose");
const review=require("./review.js");

const listingSchema=new mongoose.Schema({

    title:{
            type:String,
            required:true,
    },
    description:{
              type:String,
    },
    
  image: {
 url:String,
 filename:String,
  },
    price:{
              type:Number,
    },
    location:{
          type:String,
    },
    country:{
              type:String,
    },
    
    category: {
    type: String,
    enum: [
        "Trending",
        "Rooms",
        "Hi-tech cities",
        "Farms",
        "Camping",
        "Amazing Pools",
        "Castles",
        "Mountain",
    ],
    default: "Trending",
},
    reviews:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review",
    }],
    owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    },

     geometry: {
          type:{
                type: String,
                enum: ['Point'],
               
          },
                coordinates: {
                      type: [Number],
                    
                }
}});

//if we remove listing then reviews associated with it should also remove post middle ware mongoose

listingSchema.post("findOneAndDelete", async function(listing) {

    if (listing && listing.reviews.length) {
        await review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const listing=mongoose.model("listing",listingSchema);

module.exports=listing;