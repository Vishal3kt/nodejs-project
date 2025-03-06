const express = require("express")
const app = express();
const { connectDB } = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:4200",
        credentials: true,
    })
);

const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter)

connectDB().then(() => {
    console.log("Database connected successfully!!!");
    app.listen(3000, () => {
        console.log("Server is running successfully")
    })
}).catch((err) => {
    console.log("Database cannot be connected!!!");
})