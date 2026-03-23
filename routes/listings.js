const express = require('express');
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js")
const {isLoggedIn} = require("./middleware.js")
const {isOwner} = require("./middleware.js")

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

//INDEX ROUTE
router.get("/", wrapAsync( async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}))
//NEW ROUTE
router.get("/new", isLoggedIn, (req, res) => {
    if(!req.isAuthenticated()){
       req.flash("error", "You must be logged in to create listing!!"); 
       return res.redirect("/login");
    }
    res.render("listings/new.ejs");
})
//SHOW ROUTE
router.get("/:id", wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",}}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing Does Not Exists")
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });

}))
//CREATE ROUTE
router.post("/", validateListing, isLoggedIn, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!")
    res.redirect("/listings");
}))
//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync( async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))
//Update Route
router.put("/:id",isLoggedIn, isOwner, wrapAsync (async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!")
    res.redirect(`/listings/${id}`);
}))
//DELETE ROUTE
router.delete("/:id",isLoggedIn, isOwner, wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}))
module.exports = router;