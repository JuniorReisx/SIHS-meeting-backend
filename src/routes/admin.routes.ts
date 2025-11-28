import { Router } from "express";
import { adminController } from "../controllers/admin.controllers.js";

export const adminRouter = Router();

adminRouter.post("/login", adminController.login.bind(adminController));
adminRouter.post("/", adminController.create.bind(adminController));
adminRouter.get("/", adminController.findAll.bind(adminController));
adminRouter.get("/:id", adminController.findById.bind(adminController));
adminRouter.put("/:id/password", adminController.updatePassword.bind(adminController));
adminRouter.delete("/:id", adminController.delete.bind(adminController));
