import type { Request, Response } from "express";
import { ldapService } from "../services/ldapService";
import type { LoginRequest, AuthResponse } from "../types/auth.types";

class AuthController {
  /**
   * POST /api/auth/login
   * Autentica usuário via LDAP
   * 
   * 
   */

  
  async login(req: Request<{}, {}, LoginRequest>, res: Response<AuthResponse>) {
    try {
      const { username, password } = req.body;

      // Validação básica
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Usuário e senha são obrigatórios"
        });
      }

      // Autentica no LDAP
      const user = await ldapService.authenticate(username, password);
return res.status(200).json({
  success: true,
  message: "Autenticado com sucesso",
  user: {
    username: user.username,
    ...(user.email && { email: user.email }),
    ...(user.displayName && { displayName: user.displayName }),
    ...(user.groups && { groups: user.groups })
  }
} as AuthResponse);
    } catch (error: any) {
      console.error("Erro no login:", error);

      if (error.message.includes("inválidos") || error.message.includes("não encontrado")) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor de autenticação"
      });
    }
  }

  /**
   * POST /api/auth/verify
   * Verifica se usuário existe no LDAP
   */
  async verifyUser(req: Request, res: Response) {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Usuário é obrigatório"
        });
      }

      const exists = await ldapService.userExists(username);

      return res.status(200).json({
        success: true,
        exists
      });

    } catch (error: any) {
      console.error("Erro ao verificar usuário:", error);

      return res.status(500).json({
        success: false,
        message: "Erro ao verificar usuário"
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout do usuário (limpa sessão)
   */
  async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso"
      });

    } catch (error: any) {
      console.error("Erro no logout:", error);

      return res.status(500).json({
        success: false,
        message: "Erro ao realizar logout"
      });
    }
  }
}

export const authController = new AuthController();