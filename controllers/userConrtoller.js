import mongoose from 'mongoose'
import userModels from '../Models/userModel.js'
import directoryModel from "../Models/directoryModel.js"

export const SignupController = async (req, res,next)=>{
  const session = await mongoose.startSession()
  const {name , email , password} = req.body
  //if user alredy exist
  const existingUser = await userModels.findOne({email})
  if(existingUser?._id) return res.status(409).json({error:"user already exist"})

  const newUserId =new mongoose.Types.ObjectId()
  const newUserRootDirId = new mongoose.Types.ObjectId()
  
   const newUserData = {_id:newUserId    ,name , email , password, rootDirID:newUserRootDirId}
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
     return next(error)
  }
  //send the response 
  return res.status(201).json({message:"user created successfully"})
  }


  //login
  export const LoginController = async (req,res)=>{
    const {email , password} = req.body 
  const userData =await userModels.findOne({email ,password}).lean()
  const cookiesJson = {
    id:userData._id.toString() , expire:Math.floor(Date.now()/1000 + 800).toString()
  }
  const key = 'Sanat1234@'
  const signeture = crypto.createHash('sha256').update(JSON.stringify(cookiesJson)).update(key).digest('base64url')
  if(!userData)return res.status(400).json({message:"email and password dont match"})
    console.log("signeture",signeture,"end")
  res.cookie('uid', Buffer.from(JSON.stringify({...cookiesJson, signeture})).toString("base64url") , { httpOnly:true , maxAge:7*24*60*60*1000, sameSite:'none', secure:true})
  res.status(200).json(userData)
  }

  //get user data 
  export const GetUserData =(req,res)=>{
    const userData = req.userData
    res.status(200).json({name:userData.name , email:userData.email})
  }

  //logout controller
  export const Logout=async (req,res)=>{
    const {uid} = req.cookies
    res.clearCookie('uid' , { sameSite:'none', secure:true} )
    res.status(200).json({message:"logout successfully happens"})
  }
  
  
