

export const AdminCheeck = async(req,res,next)=>{
const {userData} = req
if(userData?.role == "user"){
   return res.status(403).json({message:"user is unAuthorized to access this route"})
}
next()
}