import mongoose from "mongoose";

try {
    mongoose.connect("mongodb://dev1:1234@localhost:27017/Storage")
  console.log("db connected")
} catch (error) {
    console.log("erroe while connecting to db", error)
}