const express = require("express");
const path = require("path");
const app = express();
const {checkForAuthenticationCookie} = require("./middlewares/authentication");
const User = require("./models/user");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const PORT = 8001;
mongoose.connect('mongodb://localhost:27017/blogify').then(e => console.log('MongoDB Connected'));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.get('/', async (req, res) => {
    if(!req.user)
    {
        res.render("home", {
            user: req.user,
            compUser: null,
        });
    }
    else
    {
        const completeUser = await User.findOne({email: req.user.email});
        res.render("home", {
            user: req.user,
            compUser: completeUser,
        });
    }
});
app.use('/user', userRoute);
app.use('/blog', blogRoute);
app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
