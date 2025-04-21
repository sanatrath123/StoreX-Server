import mongoose from 'mongoose'
import userModels from '../Models/userModel.js'
import directoryModel from "../Models/directoryModel.js"
import bcrypt from 'bcrypt'
import SessionModel from '../Models/Sessions.js'

export const SignupController = async (req, res,next)=>{
  const session = await mongoose.startSession()
  const {name , email , password} = req.body

  const newUserId =new mongoose.Types.ObjectId()
  const newUserRootDirId = new mongoose.Types.ObjectId()
  const hasedPswd = await bcrypt.hash(password, 10)
  
   const newUserData = {_id:newUserId    ,name , email , password:hasedPswd, rootDirID:newUserRootDirId}
   const rootDirData = {_id:newUserRootDirId, "name": `root-${email}`,userId:newUserId, "parent": null}
  
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
     return res.status(404).json({error:"invalid fields", details:error})
    }
    if(error.code ==11000){
      return res.status(409).json({error:"user already exist"})
    }
    console.log(error)
     return next(error)
  }
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
  const prevSessions = await SessionModel.find({userId:userData?._id})
  if(prevSessions.length>2){
   await prevSessions[0].deleteOne()
    //const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
const userSession = new SessionModel({userId:userData?._id})
  const deviseInfo = parseUserAgent(req.headers['user-agent'])
  userSession.addNewDevise(deviseInfo)
  await userSession.save()
  res.cookie('sid', Buffer.from(userSession._id, 'utf-8').toString("base64url") , { httpOnly:true , maxAge:7*24*60*60*1000, sameSite:'none', secure:true, signed: true})
  res.status(200).json(userData)
  } catch (error) {
    console.log("error while login", error)
    next(new Error)
  }
  }

  
 // maxAge:7*24*60*60*1000
  //get user data 


  export const GetUserData =async (req,res)=>{
    const {userData}  = req
    res.status(200).json({name:userData?.name , email:userData?.email, emailVarified:userData?.emailVarified})
  }

  //logout controller
  export const Logout=async (req,res)=>{
    const {sid} = req.cookies
await SessionModel.deleteOne({_id:sid})
    res.clearCookie('sid' , { sameSite:'none', secure:true} )
    res.status(200).json({message:"logout successfully happens"})
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
  


    // //login
    // export const LoginController = async (req,res)=>{
    //   const {email , password} = req.body 
    // const userData =await userModels.findOne({email ,password}).lean()
    // const cookiesJson = {
    //   id:userData._id.toString() , expire:Math.floor(Date.now()/1000 + 800).toString()
    // }
    // const key = 'Sanat1234@'
    // const signeture = crypto.createHash('sha256').update(JSON.stringify(cookiesJson)).update(key).digest('base64url')
    // if(!userData)return res.status(400).json({message:"email and password dont match"})
    //   console.log("signeture",signeture,"end")
    // res.cookie('uid', Buffer.from(JSON.stringify({...cookiesJson, signeture})).toString("base64url") , { httpOnly:true , maxAge:7*24*60*60*1000, sameSite:'none', secure:true})
    // res.status(200).json(userData)
    // }
  