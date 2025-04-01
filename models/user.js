const {createHmac, randomBytes} = require("crypto");
const {Schema, model} = require("mongoose");
const {createTokenForUser} = require("../services/authentication");
const path = require("path");
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
}, {timestamps: true});
userSchema.pre("save", function (next)
{
    if(!this.isModified("password"))
    return;
    const salt = randomBytes(16).toString();
    const hashedpassword = createHmac('sha256', salt).update(this.password).digest("hex");
    this.salt = salt;
    this.password = hashedpassword;
    next();
});
userSchema.static("matchPassword", async function (email, password){
    const user = await this.findOne({email});
    if(!user)
    throw new Error('User not found!');
    const salt = user.salt;
    const hashedpassword = user.password;
    const userHash = createHmac("sha256", salt).update(password).digest("hex");
    if(hashedpassword !== userHash)
    throw new Error('Incorrect Password');
    const token = createTokenForUser(user);
    return token;
});
const User = model("user", userSchema);
module.exports = User;