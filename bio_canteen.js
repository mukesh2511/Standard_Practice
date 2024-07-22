const http = require("http");
const url = require("url");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const server = http.createServer((req, res) => {
  cors()(req, res, () => {
    console.log("Attendance management device for canteen connected");
    const parsedUrl = url.parse(req.url, true);
    const queryParams = parsedUrl.query;

    if (req.method === "GET" && queryParams.SN) {
      const deviceSerialNumber = queryParams.SN;
      console.log(queryParams.SN);
      console.log("Device Serial Number:", deviceSerialNumber);

      // Construct the response data
      const responseData =
        `GET OPTION FROM: ${deviceSerialNumber}\n` +
        `Stamp=999\n` +
        `OpStamp=9999\n` +
        `ErrorDelay=60\n` +
        `Delay=30\n` +
        `TransTimes=00:00;14:05\n` +
        `TransInterval=1\n` +
        `TransFlag=1111000000\n` +
        `Realtime=1\n` +
        `Encrypt=0`;

      // Send the response
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(responseData);
    } else if (req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        // Assuming tab-separated values
        const data = body.split("\t");
        const deviceSerialNumber = data[0];
        const timestamp = data[1];
        const checkType = data[2];
        const userName = data[3];

        handleAttendanceRecordUpload({
          SN: deviceSerialNumber,
          Stamp: timestamp,
          CheckType: checkType,
          UserName: userName,
        })
          .then(() => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("OK");
          })
          .catch((error) => {
            console.error("Error handling attendance record upload:", error);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error");
          });
      });
    }
  });
});

const handleAttendanceRecordUpload = async (data) => {
  const userID = data.SN;

  if (userID.includes("OPLOG")) {
    // console.log("OPLOG 3: Card punched");
  } else {
    let type;
    const timestamp = data.Stamp;
    const userName = data.UserName;

    if (userName == 4) {
      type = "Card";
    } else {
      type = "Biometric";
    }

    console.log("UserID:" + userID);
    console.log("CheckType:" + type);
    console.log("Check In Time:" + timestamp);

    // const uri =
    //   "mongodb+srv://seetaofficial25:Seeta2528@cluster0.ao5tlar.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"; // Update with your MongoDB URI
    const client = new MongoClient(process.env.MongoDB_Atlas);

    try {
      await client.connect();
      const database = client.db("pradeep-cms");
      const collection = database.collection("log");
      const workersCollection = database.collection("employee_workers");
      const staffsCollection = database.collection("employee_staffs");
      const helperssCollection = database.collection("employee_helpers"); // Assigning the collection to userAtt
      // Assigning the collection to userAtt

      const mastersCollection = database.collection("employee_masters"); // Assigning the collection to userAtt
      const query = {
        $or: [
          { AttendanceCode: userID }, // Query condition for employee_workers
          { AttendanceCode: userID }, // Query condition for employee_staffs
          { AttendanceCode: userID },
          { AttendanceCode: userID }, // Query condition for employee_masters
        ],
      };
      const user = await Promise.all([
        workersCollection.findOne(query),
        staffsCollection.findOne(query),
        mastersCollection.findOne(query),
        helperssCollection.findOne(query),
      ]);
      // const user = await masters.findOne({ userPin: userID });
      //  if(user)
      //  {
      //     console.log(user._id);

      //     const result = await collection.insertOne({
      //         userID: user._id,
      //         AttendanceCode: userID,
      //         checkType: type,
      //         timestamp,
      //       });
      //  }
      const filteredUser = user.filter((user) => user !== null);
      console.log(filteredUser);

      //   if (filteredUser.length > 0) {
      //     console.log(filteredUser[0]._id); // Assuming you want to access the _id of the first matching record

      const result = await collection.insertOne({
        userID: userID, // Using the _id of the first matching record
        AttendanceCode: userID,
        checkType: type,
        timestamp,
      });
      if (result) {
        console.log("Inserted");
      } else {
        console.log("Somethig is missing here!!");
      }
      //   } else {
      //     console.log("No matching record found for userID:", userID);
      //   }
    } finally {
      await client.close();
    }
  }
};

const PORT = 8085;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
