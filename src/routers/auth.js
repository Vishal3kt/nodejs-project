const express = require("express");
const { validateSignupData } = require("../utilis/validation")
const User = require("../models/user")
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req)

        const { firstName, lastName, emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists. Please log in." });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName, lastName, emailId, password: passwordHash
        });

        await user.save();
        res.json({ message: "User added successfully!" });
    } catch (err) {
        res.status(400).send("ERROR : " + err.message)
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId })
        if (!user) {
            throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {

            const token = await user.getJWT();

            res.cookie("token", token, { httpOnly: true, secure: true, sameSite: 'None' })
            res.json({ message: 'Login successful', token: token });

        } else {
            throw new Error("Invalid credentials")
        }

    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
})

authRouter.post("/logout", async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
        });
        res.status(200).send({ message: 'Logout successful' });
    } catch (err) {
        res.status(400).send("ERROR :" + err.message);
    }
})

module.exports = authRouter;