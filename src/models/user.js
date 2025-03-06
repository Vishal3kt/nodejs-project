const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid")
            }
        }
    },
    photoUrl: {
        type: String,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photoUrl" + value)
            }
        }
    },
    about: {
        type: String,
        default: "This is default value of user"
    },
    skills: {
        type: [String]
    },
},
    {
        timestamps: true,
    }

)

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJWT = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id }, "DEV@Tinder$7676", {
        expiresIn: "1d",
    })

    return token;
}

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel


