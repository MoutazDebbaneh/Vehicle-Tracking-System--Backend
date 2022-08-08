const User = require("../models/user");

exports.delete = async function (req, res) {
  try {
    const userId = req.params.id;

    if (!require("mongoose").Types.ObjectId.isValid(userId))
      return res.status(400).json({
        error: "Invalid user id",
      });

    User.deleteOne({ _id: userId }, (err, _) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ msg: `User with id = ${id} deleted` });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getSelf = async function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const userId = req.userId;
    const user = await User.findById(userId);
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getById = async function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const userId = req.params.id;

    if (!require("mongoose").Types.ObjectId.isValid(userId))
      return res.status(400).json({
        error: "Invalid user id",
      });

    const user = await User.findById(userId);

    if (!user)
      return res.status(400).json({ error: "No matching user was found" });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMany = function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const skip = req.query.skip;
    const limit = req.query.limit;

    const options = {};
    if (skip) options["skip"] = skip;
    if (limit) options["limit"] = limit;

    User.find(null, null, options, function (err, users) {
      if (err) return res.status(500).json({ error: error.message });
      return res.json({ count: users.length, users });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.update = async function (req, res) {
  try {
    //Should be called after authenticateToken() only
    const id = req.params.id;
    const Ownid = req.userId;
    const reqUpdateFields = req.body;

    if (!require("mongoose").Types.ObjectId.isValid(id))
      return res.status(400).json({
        error: "Invalid user id",
      });

    let user = await User.findById(id);

    if (!user)
      return res.status(400).json({ error: "No matching user was found" });

    if (!user._id.toString() === Ownid) {
      const ownUser = await User.findById(Ownid);
      if (ownUser.type !== "admin")
        return res.status(401).json({
          error: "You don't have permissions to perform this operation",
        });
    }

    if (!reqUpdateFields)
      return res.status(400).json({
        error: "Missing required argument(s)",
      });

    let count = 0;

    for (const key in reqUpdateFields) {
      if (reqUpdateFields[key] && key in User.schema.obj && key != "id") {
        user[key] = reqUpdateFields[key];
        count++;
      }
    }

    if (count === 0)
      return res.status(400).json({
        error: "Missing required argument(s)",
      });

    user = await user.save();
    res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
