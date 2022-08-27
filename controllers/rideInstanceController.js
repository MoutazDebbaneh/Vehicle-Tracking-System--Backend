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

    const { rideId, latitude, longitude, rotation, accuracy } = req.body;

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

    rideInstance.path.push({ longitude, latitude, rotation, accuracy });

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

    if (!ride.is_repeatitive) ride.is_finished = true;

    ride.is_active = false;
    await ride.save();

    return res.json(rideInstance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInstances = async function (req, res) {
  try {
    const { rideId } = req.params;
    const userId = req.userId;

    const ride = await Ride.findById(rideId.toString());

    if (!ride) return res.status(400).json({ error: "Ride was not found" });

    let hasAccess = false;

    if (ride.is_public) hasAccess = true;
    else if (ride.drivers.map((e) => e.id.toString()).includes(userId))
      hasAccess = true;
    else {
      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ error: "User not found" });
      if (
        user.type == "admin" ||
        user.private_rides.map((e) => e.toString()).includes(rideId.toString())
      )
        hasAccess = true;
    }

    if (!hasAccess)
      return res.status(401).json({ error: "Unauthorized driver" });

    const instances = await RideInstance.find({ ride_id: rideId }, [
      "_id",
      "ride_id",
      "driver_id",
      "start_date",
      "end_date",
    ]);

    return res.json({ count: instances.length, instances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async function (req, res) {
  try {
    const { instanceId } = req.params;
    const userId = req.userId;

    const instance = await RideInstance.findById(instanceId);

    if (!instance)
      return res.status(400).json({ error: "Instance was not found" });

    const ride = await Ride.findById(instance.ride_id);

    if (!ride) return res.status(400).json({ error: "Instance was not found" });

    let hasAccess = false;

    if (ride.is_public) hasAccess = true;
    else {
      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ error: "User was not found" });
      hasAccess =
        user.type == "admin" ||
        user.private_rides
          .map((e) => e.toString())
          .includes(instance.ride_id.toString());
    }

    if (!hasAccess)
      return res.status(401).json({ error: "Unauthorized access" });

    return res.json(instance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
