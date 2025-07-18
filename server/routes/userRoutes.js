import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { signup, login, checkAuth, updateProfile } from "../controllers/userController.js";



const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/updateProfile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;

