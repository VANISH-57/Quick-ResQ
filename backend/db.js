import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/quick_resq")
  .then(() => console.log("MongoDB Connected (Local)"))
  .catch(err => console.error("MongoDB Error:", err));
