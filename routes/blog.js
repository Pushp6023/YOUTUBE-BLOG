const {Router} = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/user");
const Blog = require("../models/blog");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
       const fileName = `${Date.now()}-${file.originalname}` 
       cb(null, fileName);
    },
});
const upload = multer({ storage: storage});
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
router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    if(!req.user)
    {
        return res.render("blog", {
            user: req.user,
            compUser: null,
            blog,
        });
    }
    else
    {
        const completeUser = await User.findOne({email: req.user.email});
        return res.render("blog", {
            user: req.user,
            compUser: completeUser,
            blog,
        });
    }
});
router.post("/", upload.single("coverImage"), async (req, res) => {
    const {title, body} = req.body;
    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});
module.exports = router;