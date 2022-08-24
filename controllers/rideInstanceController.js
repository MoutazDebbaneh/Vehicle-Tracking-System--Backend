const RideInstance = require("../models/rideInstance");
const User = require("../models/user");
const Ride = require("../models/ride");

exports.start = async function (req, res) {
  try {
    const { rideId } = req.params;
    const driverId = req.userId;
    const { start_date } = req.body;

    if (!rideId || !driverId || !start_date)
      return res.status(400).json({ error: "Missing required argument(s)" });

    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(400).json({ error: "Ride was not found" });

    if (!ride.drivers.map((e) => e.id.toString()).includes(driverId))
      return res.status(401).json({ error: "Unauthorized driver" });

    ride.is_active = true;

    const driver = await User.findById(driverId);

    if (!driver) return res.status(400).json({ error: "Driver was not found" });

    let rideInstance = new RideInstance({
      ride_id: rideId,
      driver_id: driverId,
      start_date,
    });

    await rideInstance.save();

    driver.current_driving_instance = rideInstance._id;
    await ride.save();
    await driver.save();

    return res.json(rideInstance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLocation = async function (req, res) {
  try {
    const { instanceId } = req.params;
    const driverId = req.userId;

    const { rideId, latitude, longitude } = req.body;

    if (!latitude || !longitude || !rideId)
      return res.status(400).json({ error: "Missing required argument(s)" });

    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(400).json({ error: "Ride was not found" });

    if (!ride.drivers.map((e) => e.id.toString()).includes(driverId))
      return res.status(401).json({ error: "Unauthorized driver" });

    if (!ride.is_active)
      return res.status(400).json({ error: "Ride is not active" });

    const rideInstance = await RideInstance.findById(instanceId);
    if (!rideInstance)
      return res.status(400).json({ error: "Ride Instance not found" });

    rideInstance.path.push({ longitude, latitude });

    await rideInstance.save();
    return res.json(rideInstance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.end = async function (req, res) {
  try {
    const { instanceId } = req.params;
    const driverId = req.userId;

    const { rideId, end_date } = req.body;

    if (!rideId)
      return res.status(400).json({ error: "Missing required argument(s)" });

    const ride = await Ride.findById(rideId);

    if (!ride) return res.status(400).json({ error: "Ride was not found" });

    if (!ride.drivers.map((e) => e.id.toString()).includes(driverId))
      return res.status(401).json({ error: "Unauthorized driver" });

    if (!ride.is_active)
      return res.status(400).json({ error: "Ride is not active" });

    const rideInstance = await RideInstance.findById(instanceId);
    if (!rideInstance)
      return res.status(400).json({ error: "Ride Instance not found" });

    const driver = await User.findById(driverId);

    driver.current_driving_instance = null;
    await driver.save();

    rideInstance.end_date = end_date;
    await rideInstance.save();

    ride.is_active = false;
    await ride.save();

    return res.json(rideInstance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function _isDriverOfRide(driverId, rideId) {
  let rideDoc = null;
  try {
    await Ride.findById(rideId)
      .exec()
      .then(
        async (ride) => {
          if (!ride) throw "Ride id doesn't match any rides";

          if (!ride.drivers.map((e) => e.id.toString()).includes(driverId))
            throw "Unauthorized driver";
        },
        (err) => {
          throw err;
        }
      );
  } catch (error) {
    throw error;
  }
}
