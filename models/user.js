const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = mongoose.Schema({
  first_name: {
    required: true,
    type: String,
    trim: true,
    min: 1,
  },

  last_name: {
    required: true,
    type: String,
    trim: true,
    min: 1,
  },

  email: {
    required: true,
    type: String,
    trim: true,
    unique: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return value.match(re);
      },
      message: "Please enter a valid email address",
    },
  },

  password: {
    required: true,
    type: String,
  },

  type: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  private_rides: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
  ],

  refreshToken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const re = /^(?=.*\d)(?=.*[.!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!this.password.match(re)) {
    const err = new Error("Invalid password");
    next(err);
  }
  this.password = await bcryptjs.hash(this.password, 8);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
