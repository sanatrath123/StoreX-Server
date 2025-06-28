import  { rm} from "node:fs/promises"
import directoryModel from "../Models/directoryModel.js"
import FileModel from "../Models/fileModel.js"
//import fileModel from "../Models/fileModel.js"
//create dir
export const CreateDir = async (req, res)=>{
  const userData = req.userData
const parentId = req.headers?.parentid || userData.rootDirID

const name = req.body.newName || "New Folder"

const isParent = await directoryModel.find({_id:parentId , userId:userData.userId})
if(!isParent.length) return res.status(401).json({err:"user is unauthorized for creating here"})

try {
  await directoryModel.insertOne({name:name , parent:parentId, userId:userData.userId})
return res.status(201).json({message:"Directory created succesfully"})
} catch (error) {
  console.log("error while creting the directory", error)
  if (err.code === 121) {
    res
      .status(400)
      .json({ error: "Invalid input, please enter valid details" });
  } else {
    next(err);
  }
}
}

//serving dir data
export const GetDirData = async (req,res,next)=>{
  const userData = req.userData
const dirId = req.params.directoryId || userData.rootDirID
const dirData = await directoryModel.findOne({_id:dirId , userId:userData.userId}).lean()
if(!dirData) return res.status(401).json({msg:"no drirectory exist"})
try {
  const childDirData = await directoryModel.find({parent:dirId, userId:userData.userId},'name').lean()
  const FileData = await FileModel.find({parent:dirId},"name extension").lean()
  const formatedDirData = childDirData.map(({_id , name})=>({id:_id ,name}))
  const formatedFileData = FileData.map(({_id , name, extension})=>({id:_id , name , extension}))
  return res.status(200).json({name:dirData.name, id:dirId ,directories:formatedDirData , files:formatedFileData})
} catch (error) {
  console.log("error while getting the directory data", error)
  res.status(404).json({error:"not found"})
}
}

//rename dir
export const RenameDir = async (req,res,next)=>{
  if(!req.params.directoryId) return res.status(404).json({error:"Invalid directory"})
   const userData = req.userData
   const dirId =   req.params.directoryId
   const newName = req.body.newName
   try {
      await directoryModel.find({_id:dirId, userId:userData.userId} , {name:newName}).lean()
      res.json({message:"file renamed succesfully"})
   } catch (error) {
      res.status(500).json({message:"error while renaming the directory"})
   }
    }


//delete directory
export const DeleteDir =  async(req,res)=>{
    const {directoryId} = req.params
    if(!directoryId) return res.status(404).json({error:"what are u doing man send the dir id"})
    if (directoryId == String(req.userData.rootDirID)) {
     res.status(404).json({message:"Cannot delete the root directory!"});
    }
try {
   await DeleteDirectory(directoryId )
   res.status(200).json({message:"Deleted succesfully"});
} catch (error) {
 res.status(404).json( {message:`error while delting ${directoryId}`})
}
 }

//delete dir function
 const DeleteDirectory =async (Id)=>{
const id = Id
const childDir = await directoryModel.find({parent:Id}, "_id")
if(childDir.length>0){
  for(const item of childDir){
    await DeleteDirectory(item._id  )
  }
}

const files = await FileModel.find({parent:Id},"_id extension")
const fileIds = files.map((item)=>item._id)

if(files.length){
  try {
    await Promise.all(files.map((item)=>rm(`./storage/${String(item._id)}${item.extension}`)))
    await FileModel.deleteMany({_id:{$in: fileIds}})
  } catch (error) {
    console.log("error while deleting the files from storage", error)
  }
}

try {
  await directoryModel.deleteOne({_id:Id})
} catch (error) {
console.log("error while delete the directory data",error, id)
}
    }