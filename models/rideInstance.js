const mongoose = require("mongoose");

const rideInstanceSchema = mongoose.Schema({
  ride_id: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
  },

  path: [
    {
      required: true,
      longitude: { type: mongoose.Types.Decimal128, required: true },
      latitude: { type: mongoose.Types.Decimal128, required: true },
    },
  ],

  start_date: { type: Date, required: true },

  end_date: { type: Date, required: false, default: null },
});

const RideInstance = mongoose.model("RideInstance", rideInstanceSchema);

module.exports = RideInstance;
