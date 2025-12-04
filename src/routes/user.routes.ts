import { Router } from "express";
import { userController } from "../controllers/users/users.controllers";

export const userRouter = Router();

// ========== ROTAS DE AUTENTICAÇÃO ==========
// POST /api/users/login - Login do usuário
userRouter.post("/login", userController.login.bind(userController));

// ========== ROTAS DE BUSCA ESPECIAL (DEVEM VIR ANTES DE /:id) ==========
// GET /api/users/username/:username - Buscar usuário por username
userRouter.get("/username/:username", userController.findByUsername.bind(userController));

// GET /api/users/department/:department - Buscar usuários por departamento
userRouter.get("/department/:department", userController.findByDepartment.bind(userController));

// ========== ROTAS CRUD BÁSICO ==========
// POST /api/users - Criar novo usuário
userRouter.post("/", userController.create.bind(userController));

// GET /api/users - Buscar todos os usuários
userRouter.get("/", userController.findAll.bind(userController));

// GET /api/users/:id - Buscar usuário por ID
userRouter.get("/:id", userController.findById.bind(userController));

// PUT /api/users/:id/password - Atualizar senha do usuário
userRouter.put("/:id/password", userController.updatePassword.bind(userController));

// PUT /api/users/:id/department - Atualizar departamento do usuário
userRouter.put("/:id/department", userController.updateDepartment.bind(userController));

// DELETE /api/users/:id - Deletar usuário
userRouter.delete("/:id", userController.delete.bind(userController));