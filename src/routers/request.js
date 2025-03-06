const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user")

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ message: "User not found" });
        }

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                message: "Invalid status type: " + status
            })
        }

        const exisitingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })

        if (exisitingConnectionRequest) {
            return res.status(400).json({
                message: "Connection Request Already Exist!!!"
            })
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "User not found!!!" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        })

        const data = await connectionRequest.save();
        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
            data
        })
    } catch (err) {
        res.status(400).send("ERROR : " + err.message)
    }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Status not allowed!!!", allowedStatus });
        }

        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid Request ID" });
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: new mongoose.Types.ObjectId(requestId),
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection Request not found" });
        }

        if (
            connectionRequest.toUserId.toString() !== loggedInUser._id.toString() &&
            connectionRequest.fromUserId.toString() !== loggedInUser._id.toString()
        ) {
            return res.status(403).json({ message: "Unauthorized: You are not allowed to review this request" });
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({ message: `Connection Request ${status}`, data });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});

module.exports = requestRouter;