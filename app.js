import express from "express"
import cors from 'cors'
import AuthCheeck from "./middlewares/Auth.js"
import directoryRouter from "./routes/directoryRoutes.js"
import fileRouter from "./routes/fileRoutes.js"
import userRouter from "./routes/userRoutes.js"
import cookieParser from "cookie-parser"

//connect with db
import "./Models/db.js"

try {

const app = express()
const port = 4000

app.use(cors({
    origin:"http://localhost:5173", credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/directory",AuthCheeck, directoryRouter)
app.use("/file",AuthCheeck, fileRouter)
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
