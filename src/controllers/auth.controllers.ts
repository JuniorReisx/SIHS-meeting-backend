import type { Request, Response } from "express";
import { ldapService } from "../services/ldapService";
import type { LoginRequest, AuthResponse } from "../types/auth.types";

class AuthController {
  async login(req: Request<{}, {}, LoginRequest>, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Usuário e senha são obrigatórios",
        });
      }

      if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({
          success: false,
          message: "Formato inválido de usuário ou senha",
        });
      }

      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      if (cleanUsername.length === 0 || cleanPassword.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Usuário e senha não podem estar vazios",
        });
      }

      const user = await ldapService.authenticate(cleanUsername, cleanPassword);

      return res.status(200).json({
        success: true,
        message: "Autenticado com sucesso",
        user: {
          username: user.username,
          ...(user.email && { email: user.email }),
          ...(user.displayName && { displayName: user.displayName }),
          ...(user.groups && { groups: user.groups }),
        },
      });
    } catch (error: any) {
      console.error("Erro no login:", error);

      if (
        error.message.includes("inválidos") ||
        error.message.includes("não encontrado") ||
        error.message.includes("credenciais")
      ) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      if (
        error.message.includes("timeout") ||
        error.message.includes("conexão")
      ) {
        return res.status(503).json({
          success: false,
          message: "Serviço de autenticação temporariamente indisponível",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor de autenticação",
      });
    }
  }

  async verifyUser(req: Request, res: Response) {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Usuário é obrigatório",
        });
      }

      if (typeof username !== "string") {
        return res.status(400).json({
          success: false,
          message: "Formato inválido de usuário",
        });
      }

      const cleanUsername = username.trim();

      if (cleanUsername.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Usuário não pode estar vazio",
        });
      }

      const exists = await ldapService.userExists(cleanUsername);

      return res.status(200).json({
        success: true,
        exists,
        message: exists ? "Usuário encontrado" : "Usuário não encontrado",
      });
    } catch (error: any) {
      console.error("Erro ao verificar usuário:", error);

      if (
        error.message.includes("timeout") ||
        error.message.includes("conexão")
      ) {
        return res.status(503).json({
          success: false,
          message: "Serviço de autenticação temporariamente indisponível",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Erro ao verificar usuário",
      });
    }
  }

  async searchUsers(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        return res.status(400).json({
          success: false,
          message: "Query de busca é obrigatória",
        });
      }

      const cleanQuery = query.trim();

      if (cleanQuery.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Query deve ter no mínimo 3 caracteres",
        });
      }

      const users = await ldapService.searchUsers(cleanQuery);

      return res.status(200).json({
        success: true,
        users,
        count: users.length,
        message:
          users.length > 0
            ? `${users.length} usuário(s) encontrado(s)`
            : "Nenhum usuário encontrado",
      });
    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);

      if (
        error.message.includes("timeout") ||
        error.message.includes("conexão")
      ) {
        return res.status(503).json({
          success: false,
          message: "Serviço de autenticação temporariamente indisponível",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Erro ao buscar usuários",
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro no logout:", error);

      return res.status(500).json({
        success: false,
        message: "Erro ao realizar logout",
      });
    }
  }

  async checkStatus(req: Request, res: Response) {
    try {
      const isHealthy = await ldapService.healthCheck();

      return res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? "ok" : "error",
        message: isHealthy
          ? "Serviço LDAP está funcionando"
          : "Serviço LDAP indisponível",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Erro ao verificar status LDAP:", error);

      return res.status(503).json({
        success: false,
        status: "error",
        message: "Não foi possível verificar o status do serviço LDAP",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const authController = new AuthController();
