import express from "express"
import cheeckId from "../middlewares/CheeckId.js"
import {CreateDir,GetDirData,RenameDir,DeleteDir} from "../controllers/directoryController.js"
import {CheeckDirAuth} from "../middlewares/DocsAccessAuth.js"

const router = express.Router()

router.param('directoryId' , cheeckId)
router.post("/",CreateDir )
router.route("/:directoryId?").get(GetDirData).patch(RenameDir).delete(DeleteDir)

export default router









