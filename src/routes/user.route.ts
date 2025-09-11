import { Router } from "express";
import { registeruser, loginuser, logoutUser} from "../controllers/user.controller";
import { UserVerify } from "../middlewares/auth.middleware";

const router = Router()
router.route("/register").post(registeruser)
router.route("/login").post(loginuser)

//secure routes
router.route("/logout").post(UserVerify, logoutUser)

export default router