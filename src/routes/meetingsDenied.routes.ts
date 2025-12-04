import { Router } from "express";
import { MeetingDeniedController } from "../controllers/meetingsDenied/meetingsDenied.controllers";

export const meetingsDeniedRouter = Router();
const controller = new MeetingDeniedController();

// CREATE
meetingsDeniedRouter.post("/", controller.create);

// READ ALL
meetingsDeniedRouter.get("/all", controller.findAll);

// READ BY ID
meetingsDeniedRouter.get("/:id", controller.findById);

// UPDATE
meetingsDeniedRouter.put("/:id", controller.update);

// DELETE
meetingsDeniedRouter.delete("/:id", controller.delete);

// FILTERS
meetingsDeniedRouter.get("/date/:date", controller.findByDate);
meetingsDeniedRouter.get("/location/:location", controller.findByLocation);
meetingsDeniedRouter.get("/responsible/:responsible", controller.findByResponsible);
meetingsDeniedRouter.get("/department/:department", controller.findByDepartment);

// UPCOMING
meetingsDeniedRouter.get("/filter/upcoming/all", controller.findUpcoming);

// PAST
meetingsDeniedRouter.get("/filter/past/all", controller.findPast);

// RANGE
meetingsDeniedRouter.get("/range/dates", controller.findByDateRange);
