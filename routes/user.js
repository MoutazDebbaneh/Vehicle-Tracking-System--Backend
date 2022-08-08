const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

userRouter.post("/add", (req, res) => res.redirect("/api/auth/signup"));

userRouter.delete(
  "/delete/:id",
  authController.authenticateToken,
  authController.authenticateAdmin,
  userController.delete
);

userRouter.patch(
  "/update/:id",
  authController.authenticateToken,
  userController.update
);

userRouter.get(
  "/all",
  authController.authenticateToken,
  authController.authenticateAdmin,
  userController.getMany
);

userRouter.get(
  "/self",
  authController.authenticateToken,
  userController.getSelf
);

userRouter.get(
  "/:id",
  authController.authenticateToken,
  authController.authenticateAdmin,
  userController.getById
);

module.exports = userRouter;
