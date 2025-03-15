import { ObjectId } from "mongodb"
import userModels from "../Models/userModel.js"

 const CheeckAuth =async (req,res,next)=>{
const {uid} = req.cookies
const validId = ObjectId.isValid(uid)
if(validId){
    const user = await userModels.findById(uid).lean()
    req.userData = user
    next()
}else{
res.status(401).json({error:"user is not allowed to access"})
}
}

export default CheeckAuth

   
