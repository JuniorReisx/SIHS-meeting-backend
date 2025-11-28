import { Router } from "express";
import { authController } from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/login", authController.login.bind(authController));
authRouter.post("/verify", authController.verifyUser.bind(authController));
authRouter.post("/logout", authController.logout.bind(authController));