const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://vishalm:Vishal7676@cluster0.7nifz.mongodb.net/devTinder")
};

module.exports = {
    connectDB,
}