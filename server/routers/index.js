import { Router } from "express";
import userRouter from "./user.router.js";

const router = Router();

router.get("/", (req, res) => {
  console.log("here");
  return res.status(200).json({
    success: true,
    message: "HRM API'S",
  });
});

router.use("/api/user", userRouter);

export default router;
