import { ObjectId } from "mongodb"
import fileModel from "../Models/fileModel.js";
import directoryModel from "../Models/directoryModel.js";

const checkId=async(req,res,next,id)=>{
const isValid = ObjectId.isValid(String(id))
if(isValid){
//     const userData = req.userData
//     const dirData = await directoryModel.findOne({_id:id}).lean()
//     const isOwner = String(dirData.userId)==String(userData._id) ? true :false
//     if(!isOwner) return res.status(401).json({error:"you are not allowed to access "})
//    req.body.dirName = dirData.name
// console.log(dirData.name)
        next()
}else{
    next(new Error("invalid id sends from client"))
}
}
export default checkId



