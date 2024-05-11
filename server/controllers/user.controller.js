import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.RefreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genetrating theaccess token and refresh token"
    );
  }
};

const register = asyncHandler(async (req, res, next) => {
  try {
    const { UserName, Email, FullName, Password } = req.body;

    if (
      [UserName, Email, FullName, Password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }
    const isUserPresent = await User.findOne({
      $or: [{ Email }, { UserName }],
    });
    if (isUserPresent) {
      throw new ApiError(
        409,
        "User already exists with this email or username"
      );
    }
    // console.log(req.files);
    // const avatarFilePath =
    //   req.files && req.files.avatar && req.files.avatar.length > 0
    //     ? req.files.avatar[0].path
    //     : null;

    // console.log({ avatarFilePath });
    // const CoverImagePath =
    //   req.files && req.files.CoverImage && req.files.CoverImage.length > 0
    //     ? req.files.CoverImage[0].path
    //     : null;
    // console.log({ avatarFilePath });
    // if (!avatarFilePath) {
    //   console.log("insode");
    //   return new ApiError(400, "Avatar field is required");
    // }

    // const avatar = await uploadOnCloudinary(avatarFilePath);
    // console.log({ avatar });
    // const coverImage = await uploadOnCloudinary(CoverImagePath);

    // if (!avatar) throw new ApiError(400, "Avatar field is required");

    const newUser = await User.create({
      ...req.body,
      UserName: UserName.toLowerCase(),
      // Avatar: avatar?.url || "",
      Avatar: "",
      // CoverImage: coverImage?.url || "",
      CoverImage: "",
    });

    const createdUser = await User.findById(newUser._id).select(
      "-Password -RefreshToken"
    );
    if (!createdUser)
      throw new ApiError(500, "Something went wrong while creating user");

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User Registered successfully"));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

///login User

const loginUser = asyncHandler(async (req, res, next) => {
  try {
    const { UserName, Email, Password } = req.body;
    console.log(req.body);
    if (!UserName && !Email) {
      throw new ApiError(400, "UserName or Email is required");
    }
    const user = await User.findOne({ $or: [{ UserName }, { Email }] });
    console.log(user);
    if (!user) throw new ApiError(404, "User Does not exists");

    const isPasswordValid = await user.isPasswordCorrect(Password);
    if (!isPasswordValid)
      throw new ApiError(401, "Invalid username or password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-Password -RefreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User LoggedIn Successfully"
        )
      );
  } catch (error) {
    console.log(error);
  }
});

///logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { RefreshToken: undefined } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

//////////////refresh access token

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies.refreshToken || req.header.refreshToken;
    if (!incommingRefreshToken) throw new ApiError(401, "Unauthorized Request");

    try {
      const decodedToken = jwt.verify(
        incommingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decodedToken._id);
      if (!user) throw new ApiError(401, "Invalid Refresh Token");

      if (user.RefreshToken !== incommingRefreshToken)
        throw new ApiError(401, "Refresh token is expired or used");

      const { newAccessToken, newRefreshToken } = generateAccessAndRefreshToken(
        user._id
      );

      const options = {
        httpOnly: true,
        secure: true,
      };

      return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            { newAccessToken, newAccessToken },
            "Access token refreshed successfully"
          )
        );
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
  } catch (error) {
    console.log(error);
  }
});

// change Password
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(401, "User not found");
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid old password");

    user.Password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password Changed Successfully"));
  } catch (error) {
    console.log(error);
  }
});

///get curent user
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
      );
  } catch (error) {
    console.log(error);
  }
});

///update user
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { FullName, Email } = req.body;
    if (!FullName || !Email) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { FullName, Email } },
      { new: true }
    ).select("-Password");
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Updated Successfully"));
  } catch (error) {
    console.log(error);
  }
});

///update avatar

const getChannelInfo = asyncHandler(async (req, res) => {
  try {
    const { username } = req.parmas;
    if (!username?.trim()) {
      throw new ApiError(400, "Username is missing");
    }
    const channel = await User.aggregate([
      { $match: { UserName: username } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Subscriber",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          ChannelSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.Subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          FullName: 1,
          UserName: 1,
          subscribersCount: 1,
          ChannelSubscribedToCount: 1,
          isSubscribed: 1,
          Avatar: 1,
          CoverImage: 1,
          Email: 1,
        },
      },
    ]);
    if (!channel?.length) {
      throw new ApiError(404, "channel does not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
      );
  } catch (error) {
    next(error);
  }
});

//WATCH HISTORY

const getWatchHistory = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "videos",
          localField: "WatchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                form: "users",
                localField: "Owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      FullName: 1,
                      UserName: 1,
                      Avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: { $first: "$owner" },
              },
            },
          ],
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user[0].watchHistory,
          "Watched history fetched successfully"
        )
      );
  } catch (error) {
    console.log(error);
  }
});

export {
  register,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUser,
};
