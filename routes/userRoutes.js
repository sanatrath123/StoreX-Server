import express from 'express'
import AuthCheeck from '../middlewares/newAuth.js'
import {SignupController,LoginController,GoogleOauth, GetUserData, Logout, GetAllUser,LogoutUserByAdmin,DeleteUserByAdmin} from "../controllers/userConrtoller.js"
import { VarificationEmail } from '../utils/EmailOtpVarification.js'
import OtpSessionModel from '../Models/OtpSession.js'
import userModels from '../Models/userModel.js'
import SessionModel from '../Models/Sessions.js' 
import {AdminCheeck} from '../middlewares/AdminCheeck.js'
import SessionModel from '../Models/Sessions.js'
import mongoose from 'mongoose'

const router = express.Router()
router.post("/signup", SignupController)
router.post("/login", LoginController)
router.post('/logout', AuthCheeck,Logout)
//get the name and user email
router.get('/profile',AuthCheeck,GetUserData )
router.post("/gooleOauth",GoogleOauth)

//admin routes
router.get("/allUsers", AuthCheeck, AdminCheeck, GetAllUser)
router.post("/AdminLogout", AuthCheeck, AdminCheeck,LogoutUserByAdmin)
router.delete("/:userId/deleteUserAccount",AuthCheeck, AdminCheeck,DeleteUserByAdmin)


//otp and verify email routes
router.post('/generateOtp',AuthCheeck, async(req,res,next)=>{
const {userData} = req
if(userData?.emailVarified) return res.status(204)
try {
    const otpId = await VarificationEmail(userData?.email)
if(!otpId) return res.status(404).json({err:"can't generate otp"}) 
    console.log("yo")
return res.status(200).json({msg:"Otp sent to ur email"})
} catch (error) {
    console.log("error while generating otp", error)
    next(new Error)
}
})

router.post('/varifyOtp',AuthCheeck,async (req,res,next)=>{
    const {userData} = req
    const {userOtp} = req.body
   try {
    const otpDoc = await OtpSessionModel.findOne({userEmail:userData?.email})
    if(!otpDoc?._id) return res.status(404).json({err:"not found"})
        if(otpDoc?.otp != userOtp) return res.status(409).json({err:"incorect Opt"})
   await otpDoc.deleteOne() 
  const dbRes = await userModels.updateOne({_id:userData?._id}, {emailVarified:true})
  console.log(dbRes)
  if(dbRes.modifiedCount)return res.status(200).json({msg:"email varified"})
next(new Error)
   } catch (error) {
    console.log("error while varify otp", error)
    next(new Error)
   }
})

export default router
