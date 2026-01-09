import { Router } from "express";
import { MeetingsTotalController } from "../controllers/meetingsTotal/meetingsTotal.controllers";

export const meetingsTotalRouter = Router();
const controller = new MeetingsTotalController();

// READ ALL
meetingsTotalRouter.get("/all", controller.findAll.bind(controller));

// FILTROS POR PERÍODO
meetingsTotalRouter.get("/filter/last-10-days", controller.findLast10Days.bind(controller));
meetingsTotalRouter.get("/filter/last-20-days", controller.findLast20Days.bind(controller));
meetingsTotalRouter.get("/filter/last-month", controller.findLastMonth.bind(controller));
meetingsTotalRouter.get("/filter/last-year", controller.findLastYear.bind(controller));

// POR MÊS ESPECÍFICO
meetingsTotalRouter.get("/month/:month", controller.findByMonth.bind(controller));

// RANGE CUSTOMIZADO
meetingsTotalRouter.get("/range/dates", controller.findByDateRange.bind(controller));

// POR STATUS
meetingsTotalRouter.get("/status/:status", controller.findByStatus.bind(controller));

// ESTATÍSTICAS
meetingsTotalRouter.get("/statistics", controller.getStatistics.bind(controller));

// FUTURAS E PASSADAS
meetingsTotalRouter.get("/filter/upcoming", controller.findUpcoming.bind(controller));
meetingsTotalRouter.get("/filter/past", controller.findPast.bind(controller));