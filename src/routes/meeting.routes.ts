import { Router } from "express";
import { meetingController } from "../controllers/meeting.controllers.js";

export const meetingRouter = Router();

meetingRouter.get("/", meetingController.findAll.bind(meetingController));
meetingRouter.post("/", meetingController.create.bind(meetingController));
meetingRouter.get("/:id", meetingController.findById.bind(meetingController));
meetingRouter.put("/:id", meetingController.update.bind(meetingController));
meetingRouter.delete("/:id", meetingController.delete.bind(meetingController));
