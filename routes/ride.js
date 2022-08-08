const express = require("express");
const rideRouter = express.Router();
const rideController = require("../controllers/rideController");
const authController = require("../controllers/authController");

rideRouter.post("/add", authController.authenticateToken, rideController.add);

rideRouter.delete(
  "/delete/:id",
  authController.authenticateToken,
  rideController.checkPermission,
  rideController.delete
);

rideRouter.patch(
  "/update/:id",
  authController.authenticateToken,
  rideController.checkPermission,
  rideController.update
);

rideRouter.get("/public", authController.authenticateToken, (req, res) =>
  rideController.getMany(req, res, "public")
);

rideRouter.get(
  "/private",
  authController.authenticateToken,
  authController.authenticateAdmin,
  (req, res) => rideController.getMany(req, res, "private")
);

rideRouter.get(
  "/all",
  authController.authenticateToken,
  authController.authenticateAdmin,
  (req, res) => rideController.getMany(req, res, "all")
);

rideRouter.get(
  "/:id",
  authController.authenticateToken,
  rideController.getById
);

module.exports = rideRouter;
