import { Router } from "express"
import { userController } from "../controller/user-controller"
import { requireInternalUser } from "../middlewares/auth-middleware"

const userRouter = Router()

userRouter.post("/", userController.register)
userRouter.post("/login", userController.login)
userRouter.get("/me", requireInternalUser, userController.me)

export { userRouter }