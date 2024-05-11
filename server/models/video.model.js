import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    VideoFile: {
      type: String,
      required: true,
    },
    ThumbNail: {
      type: String,
      required: true,
    },
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Duration: {
      type: String,
      required: [true, "Password is required"],
    },
    Views: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
    Owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    RefreshToken: String,
  },
  { timestamps: true }
);

videoSchema.plugin(aggregatePaginate);

// export const User = Mongoose.model("Video",videoSchema);
export default mongoose.model("Video", videoSchema);
