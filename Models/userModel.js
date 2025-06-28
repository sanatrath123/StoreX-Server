import mongoose,{model, Schema} from "mongoose";
import { type } from "os";

const userSchema = new Schema({
    name: {
        type: String,
        minLength: 4,
        required: [true, 'name is required'],
      },
      password: {
        type: String,
        minLength: 5,
       default:null
      },
      email: {
     type:String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
      },
      rootDirID: {
        type: Schema.Types.ObjectId,ref:"directoryDB"
      },
avatar:{
type:String, default:null
},
GoogleSubID:{
  type:String , default:null
}
,
      emailVarified:{
        type:Boolean , default:false
      },
      role:{
        type:String , enum:["admin", "user", "manager", "owner"], default:"user"
      },
      isDeleted:{
        type:Boolean , default:false
      }
},{timestamps:true})

const userModels =  model('userDB',userSchema,'userDB')


export default userModels