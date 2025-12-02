import { Router } from "express";
import { adminController } from "../controllers/admin.controllers";

export const adminRouter = Router();

// ========== ROTAS DE AUTENTICAÇÃO ==========
// POST /api/admin/login - Login do administrador
adminRouter.post("/login", adminController.login.bind(adminController));

// ========== ROTAS CRUD ==========
// POST /api/admin - Criar novo administrador
adminRouter.post("/", adminController.create.bind(adminController));

// GET /api/admin - Buscar todos os administradores
adminRouter.get("/", adminController.findAll.bind(adminController));

// GET /api/admin/:id - Buscar administrador por ID
adminRouter.get("/:id", adminController.findById.bind(adminController));

// PUT /api/admin/:id/password - Atualizar senha do administrador
adminRouter.put("/:id/password", adminController.updatePassword.bind(adminController));

// DELETE /api/admin/:id - Deletar administrador
adminRouter.delete("/:id", adminController.delete.bind(adminController));
