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
},

bookings:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Booking",
    }
],
});

//if we remove listing then reviews associated with it should also remove        Post middle ware mongoose

listingSchema.post("findOneAndDelete", async function (listingDoc) {

    if (!listingDoc) return;

    if (listingDoc.reviews.length) {
        await review.deleteMany({
            _id: { $in: listingDoc.reviews }
        });
    }

    const Booking = require("./booking");

    await Booking.deleteMany({
        listing: listingDoc._id
    });

});


const listing=mongoose.model("listing",listingSchema);

module.exports=listing;


// Interview answer

// This middleware runs only when a findOneAndDelete() query is executed because it is registered as post("findOneAndDelete"). 
// Methods like findByIdAndDelete() internally call findOneAndDelete(), so the middleware executes after the listing is deleted.
//  It does not run for create(), save(), findOneAndUpdate(), or deleteOne() unless separate middleware is registered for those operations.

// Visual Flow
// Listing.findByIdAndDelete(id)
//             │
//             ▼
// findOneAndDelete({_id:id})
//             │
//             ▼
// MongoDB deletes listing
//             │
//             ▼
// post("findOneAndDelete") middleware
//             │
//             ▼
// Delete all reviews