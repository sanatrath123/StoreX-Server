import {Schema,model} from "mongoose";

const fileSchema = new Schema({
    name:{
        type:String, minLength:[2, "Lenght atlest more than 1"], required:[true,"name must be reqiured"]
    },
    extension:{
        type:String, required:[true , "extension is missing"]
    },
    parent:{
        type:Schema.Types.ObjectId , required:[true , "parent of the file is missing"], ref:"directoryDB"
    }
},{timestamps:true})

const fileModel = model("fileDB",fileSchema,"fileDB")

export default fileModel