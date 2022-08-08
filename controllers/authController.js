require("dotenv").config();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = async function (req, res) {
  try {
    let { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password)
      return res.status(400).json({ error: "Missing required argument(s)" });

    email = email.toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with the same email already exists" });
    }

    let user = new User({
      first_name,
      last_name,
      email,
      password,
    });

    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signin = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing required argument(s)" });

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ error: "No users with the same email were found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ error: "Incorrect password for this email" });
    }

    const userPayload = { id: user._id };
    const accessToken = _generateAccessToken(userPayload);
    const refreshToken = jwt.sign(
      userPayload,
      process.env.REFRESH_TOKEN_SECRET
    );

    user.refreshToken = refreshToken;

    await User.findByIdAndUpdate(user._id, { refreshToken }, { upsert: false });

    return res.json({ accessToken, refreshToken, ...user._doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.signout = async function (req, res) {
  const reqToken = req.body.refreshToken;
  jwt.verify(
    reqToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decodedUser) => {
      if (err) {
        console.log(err.message);
        return res.status(403).json({ error: "Invalid refresh token" });
      }
      const userId = decodedUser.id;
      refreshToken = "";
      await User.findByIdAndUpdate(userId, { refreshToken }, { upsert: false });
      res.json({ msg: "Signed out successfully" });
    }
  );
};

exports.authenticateToken = function (req, res, next) {
  let authHeader = req.headers["authorization"];
  let reqToken = authHeader && authHeader.split(" ")[1];

  if (!reqToken)
    return res
      .status(401)
      .json({ error: "Access token is required to access this URL" });

  jwt.verify(reqToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedUser) => {
    if (err) {
      console.log(err.message);
      return res.status(403).json({ error: "Invalid access token" });
    }
    req.userId = decodedUser.id;
    next();
  });
};

exports.authenticateAdmin = function (req, res, next) {
  try {
    //Should be called after authenticateToken() only
    const userId = req.userId;
    User.findById(userId)
      .exec()
      .then((doc) => {
        if (doc.type !== "admin")
          return res
            .status(401)
            .json({ error: "You must be an admin to access this URL" });
        else next();
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.regenerateAccessToken = async function (req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res
      .status(401)
      .json({ error: "You need to provide a refresh token" });

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decodedUser) => {
      if (err) return res.status(403).json({ error: "Invalid refresh token" });
      const decodedId = decodedUser.id;
      User.findById(decodedId, async (err, doc) => {
        if (err)
          return res.status(403).json({ error: "Invalid refresh token" });
        if (doc.refreshToken !== refreshToken)
          return res.status(403).json({ error: "Invalid refresh token" });
        const accessToken = _generateAccessToken({ id: decodedId });
        res.json({ accessToken });
      });
    }
  );
};

function _generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
}
