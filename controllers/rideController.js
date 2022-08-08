const Ride = require("../models/ride");
const User = require("../models/user");

exports.add = async function (req, res) {
  try {
    const { title, start_point, end_point } = req.body;

    const creator = req.userId;

    if (!creator || !title || !start_point || !end_point)
      return res.status(400).json({ error: "Missing required argument(s)" });

    const payload = { creator };

    for (const key in req.body) {
      if (req.body[key] && key in Ride.schema.obj && key != "id") {
        payload[key] = req.body[key];
      }
    }

    let ride = new Ride(payload);

    ride = await ride.save();
    res.json(ride);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async function (req, res) {
  try {
    const id = req.params.id;

    Ride.deleteOne({ _id: id }, (err, _) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ msg: `Ride with id = ${id} deleted` });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.checkPermission = async function (req, res, next) {
  try {
    //Should be called after authenticateToken() only
    const userId = req.userId;
    const rideId = req.params.id;

    if (!require("mongoose").Types.ObjectId.isValid(rideId))
      return res.status(400).json({
        error: "Invalid ride id",
      });
    await Ride.findById(rideId)
      .exec()
      .then(
        async (ride) => {
          if (!ride) {
            return res.status(400).json({
              error: "Ride id doesn't match any rides",
            });
          }

          hasAccess = await _isCreatorOrAdmin(ride, userId);
          if (!hasAccess) {
            return res.status(401).json({
              error: "You don't have permissions to perform this operation",
            });
          }
          next();
        },
        (err) => {
          return res.status(500).json({
            error: err.message ?? "Unexpected error",
          });
        }
      );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const userId = req.userId;
    const rideId = req.params.id;

    if (!require("mongoose").Types.ObjectId.isValid(rideId))
      return res.status(400).json({
        error: "Invalid ride id",
      });

    const ride = await Ride.findById(rideId);

    if (!ride)
      return res.status(400).json({ error: "No matching ride was found" });

    hasAccess = _isCreatorOrAdmin(ride, userId);
    if (!hasAccess) {
      return res.status(401).json({
        error: "You don't have permissions to perform this operation",
      });
    }

    return res.json(ride);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMany = function (req, res, type) {
  try {
    //Should be called after authenticateToken() only
    const skip = req.query.skip;
    const limit = req.query.limit;

    const filter =
      type === "all" ? {} : { is_public: type === "public" ? true : false };

    const options = {};
    if (skip) options["skip"] = skip;
    if (limit) options["limit"] = limit;

    Ride.find(filter, null, options, function (err, rides) {
      if (err) return res.status(500).json({ error: error.message });
      return res.json({ count: rides.length, rides });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.update = async function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const rideId = req.params.id;
    const reqUpdateFields = req.body;

    if (!reqUpdateFields)
      return res.status(400).json({
        error: "Missing required argument(s)",
      });

    let ride = await Ride.findById(rideId);
    let count = 0;

    for (const key in reqUpdateFields) {
      if (
        reqUpdateFields[key] &&
        key in Ride.schema.obj &&
        key != "id" &&
        key != "creator"
      ) {
        ride[key] = reqUpdateFields[key];
        count++;
      }
    }

    if (count === 0)
      return res.status(400).json({
        error: "Missing required argument(s)",
      });

    ride = await ride.save();
    res.json(ride);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

async function _isCreatorOrAdmin(ride, userId) {
  //Assumes both args are correct
  if (ride.creator.toString() === userId) return true;

  await User.findById(userId)
    .exec()
    .then(
      (doc) => {
        return doc.type === "admin";
      },
      (err) => {
        throw err.message ?? "Unexpected error";
      }
    );
}
