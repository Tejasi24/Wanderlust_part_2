const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); 
const ExpressError = require("./utils/ExpressError.js");
const listingsRoute = require("./routes/listings.js");
const reviewsRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
const session = require("express-session")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const sessionOptions = {
    secret: "lvusumedh",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: + 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}
app.get("/", (req, res) => {
    res.send("Hii, I am root");
})
app.use(session(sessionOptions))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
main()
    .then(() => {
        console.log("Connection succesfull");
    })
    .catch(err => console.log(err));
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;  
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// })

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews",reviewsRoute);
app.use("/", userRoute)

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!!!!!"));
});
app.use((err, req, res, next) => {
    let {status = 500, message = "something went wrong"} = err;
    // res.status(status).send(msg);
    res.status(status).render("error.ejs", {err});
})
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
})