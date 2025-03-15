import  { model, Schema } from "mongoose";

const directorySchema = new Schema({
   name:{
    type:String, minLength:2, required:[true, "Name is required"] 
   },
   userId:{
    type:Schema.Types.ObjectId, required:[true, "invalid user id"], ref:"userDB"
   },
   parent:{
    type:Schema.Types.ObjectId , default:null 
   }
},{timestamps:true})

const directoryModel = model("directoryDB", directorySchema, "directoryDB")

export default directoryModel

