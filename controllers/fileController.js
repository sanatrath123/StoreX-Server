import fs from "node:fs/promises"
import {createWriteStream } from 'node:fs'
import path from "node:path"
import fileModel from "../Models/fileModel.js"
import directoryModel from "../Models/directoryModel.js"


export const CreateFile = async (req,res,next)=>{
const fileName = req.params.fileName 
const userData = req.userData
const parentId = req.headers.parentid || userData.rootDirID
if(!fileName) return res.status(404).json({error:"send a file with proper name"})
const extension = path.extname(fileName)
const name = path.basename(fileName , extension)

//cheeck the same name exist or not 
try {
    const allFiles = await fileModel.findOne({parent:parentId , name})
if(allFiles?.name) return res.status(409).json({error:"can not upload the same file again"})
    console.log({name:name , extension:extension , parent:parentId})
    const fileRes =  await fileModel.create({name:name , extension:extension , parent:parentId})
if(!fileRes._id) return  next()
 const writableStream = createWriteStream(`./storage/${String(fileRes._id)}${extension}`)
 req.pipe(writableStream)
writableStream.on("finish", async ()=>{
   return res.status(201).json({message:"file uploaded "})
    })
//if file transfer failed
writableStream.on('error',async (err)=>{
        await fileModel.deleteOne({_id:fileRes.insertedId})
        next(err)
    })
} catch (error) {
    console.log("error while uploading the files", error)
    res.status(404).json({error:"file uploaded  failed!!"})
}
}

export const GetFile = async (req, res,next) => {
    const userData = req.userData
    const { fileId } = req.params;
    if(!fileId)  return res.status(404).json({message:"file not found"})

        try {
            const fileData =await fileModel.findById(fileId).populate({path:"parent", select:"userId -_id"})

    if(String(userData.userId) !== String(fileData.parent.userId)){
    return  res.status(401).json({error:"you are not allowed to open this file"})
    }
    
    if (req.query.action === "download") {
 res.setHeader("Content-Disposition", `attachment; filename="${fileData.name}${fileData.extension}"`)
    } 
        res.status(200).sendFile(`${process.cwd()}/storage/${fileId}${fileData.extension}` , (err)=>{
            if(!res.headersSent && err){
                return res.status(404).json({message:"file not found"})
            }
        } );
        } catch (error) {
            console.log("error in the get file route", error)
            next(error)
        }

}

export const RenameFile = async (req,res,next)=>{
    const userData = req.userData
const {fileId} = req.params
const newName = req.body.newName
const parentDirClient = req.headers.parentid || userData.rootDirID
const extension = path.extname(newName)
    const name = path.basename(newName , extension)
if(!newName) return res.json({message:"name is missing"})

try {
    const fileData = await fileModel.findById(fileId).populate({
        path:"parent" , select:"userId"
    })
console.log( String(parentDirClient))
if( String(fileData.parent._id) !== String(parentDirClient) ||  String(fileData.parent.userId) !== String(userData.userId) ){
    return res.status(401).json({error:"you are not allowed to rename from some other folder"})
}
try {
  const dbres =  await  fileModel.findByIdAndUpdate(fileId, {$set:{name:name}}, {new:true})
  console.log(dbres)
  if(!dbres._id) res.status(409).json({message:"name must not be same"})
  res.json({"message":"Renamed succesfully"})
  } catch (error) {
     console.log("error while renaming the file", error)
     next(new Error("failed to rename")) 
  }
} catch (error) {
    console.log(error)
    next(new Error("failed to run this handler function"))
}
}

//file delete
export const deleteFile = async (req,res,next)=>{
    const {fileId} = req.params
    const userData = req.userData
    const parentDirId = req.headers.parentid || userData.rootDirID

try {
    const dirData =await directoryModel.findOne({_id:parentDirId, userId:userData.userId})
    if(!dirData?._id){
     return  res.status(401).json({error:"you are not allowed to open this file"})
    }
 const fileData = await fileModel.findByIdAndDelete(fileId)
 console.log(fileData)
 await fs.rm(`./storage/${fileData._id}${fileData.extension}`, {recursive:true})
 res.status(200).json({"message":"deleted succesefully"})
} catch (error) {
    console.log("error while delete a file",error)
    res.json({message: error})
}

}