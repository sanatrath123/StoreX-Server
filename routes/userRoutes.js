import express from 'express'
import AuthCheeck from '../middlewares/Auth.js'
import {SignupController,LoginController, GetUserData, Logout} from "../controllers/userConrtoller.js"

const router = express.Router()

router.post("/signup", SignupController)
router.post("/login", LoginController)
router.post('/logout', AuthCheeck,Logout)
//get the name and user email
router.get('/',AuthCheeck,GetUserData )


export default router
