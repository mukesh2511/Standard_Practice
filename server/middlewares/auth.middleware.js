import { ApiError } from "../utils/ApiError.js";
import JWT from "jsonwebtoken";
import User from "../models/user.model.js";

const JwtVerify = async (req, _, next) => {
  try {
    const accessToken =
      req.cookies.accessToken ||
      req.header("Authorization").replace("Bearer ", "");
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedUser = JWT.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedUser._id).select(
      "-Password -RefreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error); // Log the error for debugging
    throw new ApiError(401, error.message || "Invalid access token");
  }
};

export { JwtVerify };
