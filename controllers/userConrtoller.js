import mongoose from 'mongoose'
import userModels from '../Models/userModel.js'
import directoryModel from "../Models/directoryModel.js"
import bcrypt from 'bcrypt'
import SessionModel from '../Models/Sessions.js'
import {VarifyIdToken} from "../utils/googleOauth.js"


export const SignupController = async (req, res,next)=>{
  const {name , email , password} = req.body

  const newUserId =new mongoose.Types.ObjectId()
  const newUserRootDirId = new mongoose.Types.ObjectId()
  const hasedPswd = await bcrypt.hash(password, 10)
  
   const newUserData = {_id:newUserId    ,name , email , password:hasedPswd, rootDirID:newUserRootDirId}
   const rootDirData = {_id:newUserRootDirId, "name": `root-${email}`,userId:newUserId, "parent": null}
   const data = await CreateNewAccount(newUserData , rootDirData)
   if(!data) return next(new Error)
  //send the response 
  return res.status(201).json({message:"user created successfully"})
  }

  //login
  export const LoginController = async (req,res,next)=>{
    const {email , password} = req.body 
  try {
    const userData =await userModels.findOne({email}).lean()
  if(!userData) return res.status(404).json({err:"users does not exist"})
const isValidPswd= await bcrypt.compare(password , userData?.password)
  if(!isValidPswd) return res.status(409).json({err:"invalid credential"})
    //find the sessions exist
 const data = await CreateSession(userData?._id)
 return data ? res.status(200).json({msg:"user Loggeg in"}) : res.status(404).json({err:"error while login"})
  } catch (error) {
    console.log("error while login", error)
    next(new Error)
  }
  }

  //gooogle signup & login
export const GoogleOauth = async (req,res,next)=>{
const {token} = req.body
if(!token) return res.status(404).json({err:"dont have token"})
  const {sub , name , email , picture} =await VarifyIdToken(token)
//cheeck if user already exist
const isExist = await userModels.findOne({email}).lean()
let newUserId
if(!isExist?._id){
  //create new user acc
 newUserId =new mongoose.Types.ObjectId()
const newUserRootDirId = new mongoose.Types.ObjectId()

   const newUserData = {_id:newUserId,name, email, rootDirID:newUserRootDirId,GoogleSubID:sub, avatar:picture , emailVarified:true}
   const rootDirData = {_id:newUserRootDirId, "name": `root-${email}`,userId:newUserId, "parent": null}
const data = await CreateNewAccount(newUserData , rootDirData)
if(data.err){
  if(data.err==11000) return res.status(409).json({error:"user already exist"})
  if(data.err==121) return res.status(404).json({error:"invalid fields"})
  if(data.err==1) return next(new Error)
}
}
//login after singup
const sesID = isExist?._id ? await CreateSession(isExist?._id, req) : await CreateSession(newUserId,req)

if(sesID) {
  res.cookie('sid', Buffer.from(sesID, 'utf-8').toString("base64url") , { httpOnly:true , maxAge:7*24*60*60*1000, sameSite:'none', secure:true, signed: true})
  return  res.status(200).json({msg:"user Loggeg in"}) 
}
 res.status(404).json({err:"error while login"})
}

  export const GetUserData =async (req,res)=>{
    const {userData}  = req
    res.status(200).json({name:userData?.name , email:userData?.email, emailVarified:userData?.emailVarified})
  }

  //logout controller
  export const Logout=async (req,res)=>{
    const {sid} = req.signedCookies
    const sessionID = Buffer.from(sid, "base64url").toString()
await SessionModel.deleteOne({_id:sessionID})
    res.clearCookie('sid' , { sameSite:'none', secure:true} )
    res.status(200).json({message:"logout successfully happens"})
  }

  //get all user 
  export const GetAllUser = async(req,res,next)=>{
    const allSessions = (await SessionModel.find().lean()).map((ses)=>ses.userId.toString())
    const allUser = await userModels.find({},{password:0,GoogleSubID:0}).lean()
    const userData = allUser.map((user)=>{ return {...user, isLogedIn:allSessions.includes(user._id.toString())}})
    return res.status(200).json(userData)
}

//looged out by admin
export const LogoutUserByAdmin = async(req,res,next)=>{
  const {userId} = req.body
try {
  const data = await SessionModel.deleteMany({userId})
  if(data.deletedCount) return res.status(200).json({message:"user logged out"})
  if(!data.acknowledged) return res.status(404).json({err:"user session does not exist"})
} catch (error) {
  console.log("error while admin logout a user", error)
  next(new Error)
}
}

//delete the user account by admin
export const DeleteUserByAdmin= async(req,res)=>{
  //this is soft deletion of user
  const {userId} = req.params 
  const {userData} = req
  if(userData._id == userId) return res.status(403).json({message:"user dont have the permission"})
      const mongooseSession =await  mongoose.startSession()
  mongooseSession.startTransaction()
  try {
      const data = await userModels.updateOne({_id:userId}, {isDeleted:true})
  if(!data.modifiedCount)return res.status(404).json({message:"user deleted request unsusessfull"})
       await SessionModel.deleteMany({userId})
  await mongooseSession.commitTransaction()
  return res.status(200).json({message:"user account deleted"})
  } catch (error) {
  console.log("error while delete the user account", error)
  await mongooseSession.abortTransaction()
  return res.status(404).json({err:"user account not deleted"})
  }finally{
      await mongooseSession.endSession()
  }
  }

  //create new Account for user
  async function CreateNewAccount(newUserData,rootDirData) {
    const session = await mongoose.startSession()
    //start the transaction
     session.startTransaction()
  try { 
    await userModels.insertOne(newUserData,{session})
    await directoryModel.insertOne(rootDirData,{session})
    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if(error.code==121){
      console.log(error)
     return {err: 121}
    }
    if(error.code ==11000){
      return {err:11000}
    }
    console.log(error)
     return {err:1}
  }
  return true
  }


   //create session function for login controller
 async function CreateSession(userId,req) {
  try {
    const prevSessions = await SessionModel.find({userId})
    if(prevSessions.length>2){
     await prevSessions[0].deleteOne()
    }
  const userSession = new SessionModel({userId})
    const deviseInfo = parseUserAgent(req.headers['user-agent'])
    userSession.addNewDevise(deviseInfo)
    await userSession.save()
    return userSession._id.toString()
  } catch (error) {
    console.log("error while Create session function", error)
    return false
  }
  }

  function parseUserAgent(ua) {
    const result = {
      device_type: /Mobile|Android/i.test(ua) ? 'Mobile' : 'Desktop',
      os_name: '',
      os_version: '',
      browser_name: '',
      browser_version: ''
    };
  
    // OS
    if (/Windows NT/i.test(ua)) {
      result.os_name = 'Windows';
      const match = ua.match(/Windows NT ([\d.]+)/);
      result.os_version = match ? match[1] : '';
    } else if (/Android/i.test(ua)) {
      result.os_name = 'Android';
      const match = ua.match(/Android ([\d.]+)/);
      result.os_version = match ? match[1] : '';
    }
  
    // Browser
    if (/Chrome\/([\d.]+)/i.test(ua) && /Edg\//i.test(ua)) {
      result.browser_name = 'Edge';
      const match = ua.match(/Edg\/([\d.]+)/);
      result.browser_version = match ? match[1] : '';
    } else if (/Chrome\/([\d.]+)/i.test(ua)) {
      result.browser_name = 'Chrome';
      const match = ua.match(/Chrome\/([\d.]+)/);
      result.browser_version = match ? match[1] : '';
    } else if (/Firefox\/([\d.]+)/i.test(ua)) {
      result.browser_name = 'Firefox';
      const match = ua.match(/Firefox\/([\d.]+)/);
      result.browser_version = match ? match[1] : '';
    }
  
    return result;
  }
  
