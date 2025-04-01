const {Router} = require("express");
const router = Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { put } = require("@vercel/blob");
const User = require("../models/user");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/tmp");
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
    const comments = await Comment.find({ blogId: req.params.id}).populate('createdBy');
    if(!req.user)
    {
        return res.render("blog", {
            user: req.user,
            compUser: null,
            blog,
            comments,
        });
    }
    else
    {
        const completeUser = await User.findOne({email: req.user.email});
        return res.render("blog", {
            user: req.user,
            compUser: completeUser,
            blog,
            comments,
        });
    }
});
router.post("/comment/:blogId", async (req, res) => {
    const comment = await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});
router.post("/", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, body } = req.body;
        const fileBuffer = fs.readFileSync(req.file.path);
        const { url } = await put(`uploads/${req.file.filename}`, fileBuffer, { access: "public" });
        const blog = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            coverImageURL: url,
        });

        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
module.exports = router;