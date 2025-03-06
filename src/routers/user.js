const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user")

// get all the pending connection request for the logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", ['firstName', 'lastName', 'photoUrl', 'age', 'about', 'gender'])

        res.json({ message: "Data fetched successfully!!!", data: connectionRequest })
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        }).populate("fromUserId", ['firstName', 'lastName', 'photoUrl', 'age', 'about', 'gender']).populate("toUserId", ['firstName', 'lastName', 'photoUrl', 'age', 'about', 'gender'])

        const data = connectionRequest.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        })

        res.json({ data })
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
            status: { $in: ["interested", "accepted"] }
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        hideUsersFromFeed.add(loggedInUser._id.toString());

        const totalUsers = await User.countDocuments({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        });

        const users = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed) }
        }).select("firstName lastName photoUrl age about gender skills")
            .skip(skip)
            .limit(limit);

        res.json({
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = userRouter;