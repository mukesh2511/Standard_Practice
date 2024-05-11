import express from "express";
import logger from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routers/index.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "20kb" }));
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public")); //////////////anyone can access files inside  the public folder
app.use(cookieParser());

////router
app.use(router);

export default app;
