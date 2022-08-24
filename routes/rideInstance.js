const express = require("express");
const rideInstanceRouter = express.Router();
const rideInstanceController = require("../controllers/rideInstanceController");
const authController = require("../controllers/authController");

rideInstanceRouter.post(
  "/start/:rideId",
  authController.authenticateToken,
  rideInstanceController.start
);

rideInstanceRouter.patch(
  "/updateLocation/:instanceId",
  authController.authenticateToken,
  rideInstanceController.updateLocation
);

rideInstanceRouter.patch(
  "/end/:instanceId",
  authController.authenticateToken,
  rideInstanceController.end
);

module.exports = rideInstanceRouter;
