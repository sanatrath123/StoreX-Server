import userModels from "../Models/userModel.js"
import SessionModel from "../Models/Sessions.js"

const CheeckAuth = async (req,res,next)=>{
const {sid} = req?.signedCookies
if(!sid) return res.status(409).json({err:"session expired"})

try {
const sessionID = Buffer.from(sid, "base64url").toString()
const sessionData = await SessionModel.findById(sessionID).lean()
if(!sessionData?._id) return res.status(409).json({err:"session expired"})
const userData = await userModels.findById(sessionData?.userId).lean()
if(!userData?._id) return res.status(409).json({err:"user dont exist"})
req.userData = userData
next()
} catch (error) {
    console.log("error while cheecking the auth", error)
    next(new Error)
}
}

export default CheeckAuth