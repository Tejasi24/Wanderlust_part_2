const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./reviews.js");

const listeningSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        // default: "https://w0.peakpx.com/wallpaper/324/350/HD-wallpaper-unsplash-sea-glass.jpg",
        set: (v) => v === ""?  "https://w0.peakpx.com/wallpaper/324/350/HD-wallpaper-unsplash-sea-glass.jpg": v, 
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});
listeningSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews}});
    }
})
const Listing = mongoose.model("Listening", listeningSchema);
module.exports = Listing;