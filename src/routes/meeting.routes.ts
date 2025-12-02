import { Router } from "express";
import { meetingController } from "../controllers/meeting.controllers";

export const meetingRouter = Router();

// ========== ROTAS DE BUSCA ESPECIAL (DEVEM VIR PRIMEIRO) ==========
// GET /api/meetings/upcoming - Buscar reuniões futuras
meetingRouter.get("/upcoming", meetingController.findUpcoming.bind(meetingController));

// GET /api/meetings/past - Buscar reuniões passadas
meetingRouter.get("/past", meetingController.findPast.bind(meetingController));

// GET /api/meetings/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD - Buscar por intervalo
meetingRouter.get("/range", meetingController.findByDateRange.bind(meetingController));

// GET /api/meetings/date/:date - Buscar reuniões por data específica
meetingRouter.get("/date/:date", meetingController.findByDate.bind(meetingController));

// GET /api/meetings/location/:location - Buscar reuniões por local
meetingRouter.get("/location/:location", meetingController.findByLocation.bind(meetingController));

// ========== ROTAS CRUD BÁSICO ==========
// POST /api/meetings - Criar nova reunião
meetingRouter.post("/", meetingController.create.bind(meetingController));

// GET /api/meetings - Buscar todas as reuniões
meetingRouter.get("/", meetingController.findAll.bind(meetingController));

// GET /api/meetings/:id - Buscar reunião por ID (DEVE VIR POR ÚLTIMO)
meetingRouter.get("/:id", meetingController.findById.bind(meetingController));

// PUT /api/meetings/:id - Atualizar reunião
meetingRouter.put("/:id", meetingController.update.bind(meetingController));

// DELETE /api/meetings/:id - Deletar reunião
meetingRouter.delete("/:id", meetingController.delete.bind(meetingController));
