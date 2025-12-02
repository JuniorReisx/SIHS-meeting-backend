import { Router } from "express";
import { userController } from "../controllers/user.controllers";

export const userRouter = Router();

userRouter.post("/", userController.create.bind(userController));
userRouter.get("/", userController.findAll.bind(userController));
userRouter.get("/:id", userController.findById.bind(userController));
userRouter.put("/:id/password", userController.updatePassword.bind(userController));
userRouter.delete("/:id", userController.delete.bind(userController));
