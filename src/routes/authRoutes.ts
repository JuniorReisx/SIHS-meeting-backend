import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

router.post("/login", authController.login.bind(authController));
router.post("/verify", authController.verifyUser.bind(authController));
router.post("/logout", authController.logout.bind(authController));

export default router;