import { Router } from "express";
import { MeetingPendingController } from "../controllers/meetingsPending/meetingsPending.controllers";

export const meetingsPendingRouter = Router();
const controller = new MeetingPendingController();

// CREATE
meetingsPendingRouter.post("/", controller.create);

// READ ALL
meetingsPendingRouter.get("/all", controller.findAll);

// READ BY ID
meetingsPendingRouter.get("/:id", controller.findById);

// UPDATE
meetingsPendingRouter.put("/:id", controller.update);

// DELETE
meetingsPendingRouter.delete("/:id", controller.delete);

// FILTERS
meetingsPendingRouter.get("/date/:date", controller.findByDate);
meetingsPendingRouter.get("/location/:location", controller.findByLocation);
meetingsPendingRouter.get("/responsible/:responsible", controller.findByResponsible);
meetingsPendingRouter.get("/department/:department", controller.findByDepartment);

// UPCOMING
meetingsPendingRouter.get("/filter/upcoming/all", controller.findUpcoming);

// PAST
meetingsPendingRouter.get("/filter/past/all", controller.findPast);

// RANGE
meetingsPendingRouter.get("/range/dates", controller.findByDateRange);

