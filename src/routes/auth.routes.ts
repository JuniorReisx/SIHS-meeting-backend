import { Router } from "express";
import { authController } from "../controllers/auth.controllers";

export const authRouter = Router();

// ========== ROTAS DE AUTENTICAÇÃO ==========
// POST /api/auth/login - Login via LDAP
authRouter.post("/login", authController.login.bind(authController));

// POST /api/auth/logout - Logout do usuário
authRouter.post("/logout", authController.logout.bind(authController));

// ========== ROTAS DE VERIFICAÇÃO ==========
// POST /api/auth/verify - Verificar se usuário existe
authRouter.post("/verify", authController.verifyUser.bind(authController));

// GET /api/auth/search?query=nome - Buscar usuários
authRouter.get("/search", authController.searchUsers.bind(authController));

// GET /api/auth/status - Status do serviço LDAP
authRouter.get("/status", authController.checkStatus.bind(authController));