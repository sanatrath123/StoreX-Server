import express from "express"
import cheeckId from "../middlewares/CheeckId.js"
import {CreateFile,GetFile,RenameFile,deleteFile} from "../controllers/fileController.js"

const router = express.Router()

router.param("fileId", cheeckId)
router.post('/:fileName?',CreateFile)
router.route("/:fileId").get(GetFile).patch(RenameFile).delete(deleteFile)

export default router


