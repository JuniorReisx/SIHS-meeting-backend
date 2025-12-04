import { Router } from "express";
import { MeetingConfirmedController } from "../controllers/meetingsConfirmed/meetingsConfirmed.controllers";

export const meetingsConfirmedRouter = Router();
const controller = new MeetingConfirmedController();

// CREATE
meetingsConfirmedRouter.post("/", controller.create);

// READ ALL
meetingsConfirmedRouter.get("/all", controller.findAll);

// READ BY ID
meetingsConfirmedRouter.get("/:id", controller.findById);

// UPDATE
meetingsConfirmedRouter.put("/:id", controller.update);

// DELETE
meetingsConfirmedRouter.delete("/:id", controller.delete);

// FILTERS
meetingsConfirmedRouter.get("/date/:date", controller.findByDate);
meetingsConfirmedRouter.get("/location/:location", controller.findByLocation);
meetingsConfirmedRouter.get("/responsible/:responsible", controller.findByResponsible);
meetingsConfirmedRouter.get("/department/:department", controller.findByDepartment);

// UPCOMING
meetingsConfirmedRouter.get("/filter/upcoming/all", controller.findUpcoming);

// PAST
meetingsConfirmedRouter.get("/filter/past/all", controller.findPast);

// RANGE
meetingsConfirmedRouter.get("/range/dates", controller.findByDateRange);

