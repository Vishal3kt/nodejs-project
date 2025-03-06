const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utilis/validation");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user")

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR :" + err.message);
    }
})

profileRouter.get("/profile/all", userAuth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
        res.send({ message: "Response received", response: users });
    } catch (err) {
        res.status(400).send({ message: "Something went wrong", error: err.message });
    }
});


profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("Invalid edit request")
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        await loggedInUser.save();

        res.json({ message: `${loggedInUser.firstName} : your Profile updated successfully!!!`, data: loggedInUser })
    } catch (err) {
        res.status(400).send("ERROR :" + err.message)
    }
})

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new Error("Current and new password are required");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new Error("User not found");
        }

        if (!user.password) {
            throw new Error("No password found for this user");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.send("Password updated successfully");
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = profileRouter;