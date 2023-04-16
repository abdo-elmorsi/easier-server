require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGODB_URI, (error) => {
    if (error) return console.log({ message: error.message });
    console.log("connected");
});
