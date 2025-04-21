import express from "express"
import cors from 'cors'
import CheeckAuth from "./middlewares/newAuth.js"
import directoryRouter from "./routes/directoryRoutes.js"
import fileRouter from "./routes/fileRoutes.js"
import userRouter from "./routes/userRoutes.js"
import cookieParser from "cookie-parser"

//connect with db
import "./Models/db.js"

const AloowedOrigin = [
    "http://[2405:201:a00b:8ed:2037:509f:dc59:4dba]:5173",
"http://localhost:5173"
]

try {

const app = express()
const port = 4000

app.use(cors({
    origin: function(origin , cb){
        if(!origin || AloowedOrigin.includes(origin)){
            cb(null , true)
        }else{
            cb(new Error("Not allowed by CORS"))
        }
    }, credentials:true
}))


app.use(express.json())
app.use(cookieParser("StoreX-123@"))



app.use("/directory",CheeckAuth, directoryRouter)
app.use("/file",CheeckAuth, fileRouter)
app.use("/user",userRouter )


app.use((err, req,res,next)=>{
res.status(500).json({error:"something went wrong"})
})

app.listen(port, ()=>{
    console.log("listing at port 4000")
})

} catch (error) {
    console.log("error can not connect to db", error)
}



