const {Router} = require("express");
const router = Router();
const User = require("../models/user");
router.get("/add-new", async (req, res) => {
    if(!req.user)
    {
        return res.render("addBlog", {
            user: req.user,
            compUser: null,
        });
    }
    else
    {
        const completeUser = await User.findOne({email: req.user.email});
        return res.render("addBlog", {
            user: req.user,
            compUser: completeUser,
        });
    }
});
module.exports = router;