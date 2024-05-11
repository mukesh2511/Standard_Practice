import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MOONGODB}/${DB_NAME}`
    );
    console.log(
      `Connected to Database✌️ to HOST ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log({ message: "Falied to connect to database", error });
    process.exit(1);
  }
};

export default connectDb;
