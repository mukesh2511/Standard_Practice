import dotenv from "dotenv";
import connectDb from "./configg/dbConfig.js";
import app from "./app.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.log({ message: "failed to connect to Database", error: err });
  });

// (async () => {
//   try {
//     app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//     connectDb();
//   } catch (error) {
//     console.log(error);
//   }
// })();

// app.use(express.static("dist"));  //this is use to serve static files directly from backend,after building the frontend we add the dist folder into the backend

// app.use(errorHandler); // Uncomment this if you have an errorHandler middleware
