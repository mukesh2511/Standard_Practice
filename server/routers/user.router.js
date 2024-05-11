import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  register,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JwtVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "CoverImage", maxCount: 1 },
  ]),
  register
);

router.route("/login").post(loginUser);
router.route("/logout").post(JwtVerify, logoutUser);
router.route("/refersh-token").post(refreshAccessToken);
router.route("/change-password").post(JwtVerify, changePassword);
router.route("/get-current-user").post(JwtVerify, getCurrentUser);
router.route("/update-user-details").post(JwtVerify, getCurrentUser);

export default router;
