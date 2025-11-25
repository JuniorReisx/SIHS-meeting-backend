import { Router } from "express";
import { meetingController } from "../controllers/meeting.controllers.js";

const router = Router();

router.post("/", meetingController.create.bind(meetingController));
router.get("/", meetingController.findAll.bind(meetingController));
router.get("/:id", meetingController.findById.bind(meetingController));
router.put("/:id", meetingController.update.bind(meetingController));
router.delete("/:id", meetingController.delete.bind(meetingController));
router.get("/date/:date", meetingController.findByDate.bind(meetingController));
router.get("/participant/:name", meetingController.findByParticipant.bind(meetingController));

export default router;