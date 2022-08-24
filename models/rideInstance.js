const mongoose = require("mongoose");

const rideInstanceSchema = mongoose.Schema({
  ride_id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
  },

  driver_id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  path: [
    {
      longitude: { type: mongoose.Types.Decimal128, required: true },
      latitude: { type: mongoose.Types.Decimal128, required: true },
    },
  ],

  start_date: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        if (!value) return true;
        const re =
          /[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2} [0-9][0-9]:[0-9][0-9] (AM|PM)/;
        return value.match(re);
      },
      error: "Please enter startn time",
    },
  },

  end_date: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        if (!value) return true;
        const re =
          /[0-9]{4,4}-[0-9]{2,2}-[0-9]{2,2} [0-9][0-9]:[0-9][0-9] (AM|PM)/;
        return value.match(re);
      },
      error: "Please enter valid end time",
    },
  },
});

const RideInstance = mongoose.model("RideInstance", rideInstanceSchema);

module.exports = RideInstance;
