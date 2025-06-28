import express from 'express'
import AuthCheeck from '../middlewares/newAuth.js'
import {SignupController,LoginController,GoogleOauth, GetUserData, Logout, GetAllUser,LogoutUserByAdmin,DeleteUserByAdmin,PermanetDelete,SoftDeletedUsers,recoverUserAccount} from "../controllers/userConrtoller.js"
import { VarificationEmail } from '../utils/EmailOtpVarification.js'
import OtpSessionModel from '../Models/OtpSession.js'
import userModels from '../Models/userModel.js'
import {AdminCheeck} from '../middlewares/AdminCheeck.js'

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
router.delete('/:userId/hard', AuthCheeck ,AdminCheeck, PermanetDelete )
router.put('/:userId/recoverDeletedUser', AuthCheeck,AdminCheeck , recoverUserAccount)
router.get('/softDeletedUsers', AuthCheeck ,AdminCheeck ,SoftDeletedUsers )

//otp and verify email routes
router.post('/generateOtp',AuthCheeck, async(req,res,next)=>{
const {userData} = req
if(userData?.emailVarified) return res.status(204)
try {
    const otpId = await VarificationEmail(userData?.email)
if(!otpId) return res.status(404).json({err:"can't generate otp"}) 
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

//user , manager , admin , owner
router.put("/:userId/changeRole/:assignRole", AuthCheeck , AdminCheeck , async(req,res,next)=>{
   const {userId,assignRole}= req.params 
   const CurrentUserData = req?.userData
if(userId == CurrentUserData?._id) return res.status(403).json({err:"u can't change ur own role"})
const isAllowed = isAllowedToRoleChange(CurrentUserData?.role , assignRole)
//if the user is manager
if(isAllowed){
   await userModels.updateOne({isDeleted:false , _id:userId}, {role:assignRole})
    return res.status(200).json({msg:`${assignRole} assigned`})
}
return res.status(404).json({err:"not allowed assigned new role to the user"})

})


//cheeck the user is allowed to change that specific role or not
const isAllowedToRoleChange =  (currentUserRole , allowRole)=>{
    if(allowRole!== "manager" && allowRole!=="admin") return false
if(currentUserRole=="manager" && allowRole=="manager") return true
if(currentUserRole!=='manager') return true
return false
}



export default router


