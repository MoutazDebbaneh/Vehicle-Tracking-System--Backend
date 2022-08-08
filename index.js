require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const rideRouter = require("./routes/ride");

const app = express();

app.use(express.json());
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/ride", rideRouter);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to DB successfully");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(process.env.PORT, process.env.HOST, () => {
  console.log(`Server running on ${process.env.HOST}:${process.env.PORT}`);
});
