const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    unique: true,
  },

  creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  drivers: [
    {
      id: {
        required: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      email: {
        required: false,
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
    },
  ],

  is_public: {
    type: Boolean,
    default: false,
  },

  is_active: {
    type: Boolean,
    default: false,
  },

  is_finished: {
    type: Boolean,
    default: false,
  },

  access_key: {
    type: String,
    default: null,
    required: false,
  },

  vehicle: {
    type: String,
    default: "Car",
    enum: ["Car", "Bus"],
  },

  is_repeatitive: { type: Boolean, default: false },

  repeatition: {
    required: false,
    default: {},

    repeatition_per_day: {
      is_looping: { type: Boolean, default: false },
      repeatition_times: [
        {
          type: String,
          required: true,
          validate: {
            validator: (value) => {
              const re = /[0-9]?[0-9]:[0-9][0-9] (AM|PM)/;
              return value.match(re);
            },
            error: "Please enter valid repeatition times",
          },
        },
      ],
    },

    repeatition_per_week: {
      required: false,
      default: {},
      repeatition_days: [
        {
          type: String,
          required: true,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ],
    },
  },

  start_point: {
    longitude: { type: mongoose.Types.Decimal128, required: true },
    latitude: { type: mongoose.Types.Decimal128, required: true },
    address: { type: String, required: false },
  },

  end_point: {
    longitude: { type: mongoose.Types.Decimal128, required: true },
    latitude: { type: mongoose.Types.Decimal128, required: true },
    address: { type: String, required: false },
  },

  key_points: [
    {
      default: [],
      required: false,
      longitude: { type: mongoose.Types.Decimal128, required: true },
      latitude: { type: mongoose.Types.Decimal128, required: true },
      address: { type: String, required: false },
    },
  ],

  one_time_date: {
    type: String,
    required: false,
    default: null,
    validate: {
      validator: (value) => {
        if (!value) return true;
        const re =
          /[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2} [0-9][0-9]:[0-9][0-9] (AM|PM)/;
        return value.match(re);
      },
      error: "Please enter valid repeatition times",
    },
  },
});

rideSchema.pre("save", async function (next) {
  try {
    if (!this.isNew) next();
    if (this.is_public) next();
    const key = require("crypto").randomBytes(16).toString("base64");
    this.access_key = key;
  } catch (error) {
    console.log("Unexpected error while saving ride::");
    console.log(error.message);
    next(error.message);
  }
});

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
