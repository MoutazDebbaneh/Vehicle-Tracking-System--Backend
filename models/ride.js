const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 1,
  },

  creator: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  is_public: {
    type: Boolean,
    default: false,
  },

  access_key: {
    type: String,
    default: null,
    required: false,
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
              const re = /[0-9][0-9]:[0-9][0-9]/;
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
  },

  end_point: {
    longitude: { type: mongoose.Types.Decimal128, required: true },
    latitude: { type: mongoose.Types.Decimal128, required: true },
  },

  key_points: [
    {
      default: [],
      required: false,
      longitude: { type: mongoose.Types.Decimal128, required: true },
      latitude: { type: mongoose.Types.Decimal128, required: true },
    },
  ],

  one_time_date: { type: Date, required: false, default: null },
});

rideSchema.pre("save", async function (next) {
  try {
    if (this.is_public) next();
    if (!this.isModified("creator")) return next();
    const ownerId = this.creator;
    owner = await require("./user").findById(ownerId);
    if (!owner) next("Ride owner could not be found");
    owner.private_rides.push(this._id);
    owner = await owner.save();
    if (owner) next();
    else next("Owner could not be edited");
  } catch (error) {
    console.log("Unexpected error while saving ride::");
    console.log(error.message);
    next(error.message);
  }
});

const Ride = mongoose.model("Ride", rideSchema);

module.exports = Ride;
