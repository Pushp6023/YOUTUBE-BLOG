const {createHmac, randomBytes} = require("crypto");
const {Schema, model} = require("mongoose");
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
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: "./public/default.png",
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
const User = model("user", userSchema);
module.exports = User;