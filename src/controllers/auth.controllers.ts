import { Request, Response } from 'express';
import { LDAPService } from '../services/ldapService';

const ldapService = new LDAPService();

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username e password são obrigatórios'
        });
      }

      const isAuthenticated = await ldapService.authenticate(username, password);

      if (!isAuthenticated) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const userInfo = await ldapService.getUserInfo(username);

      return res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        user: userInfo
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao realizar login'
      });
    }
  }

  async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await ldapService.testConnection();

      return res.status(200).json({
        success: true,
        connected: isConnected,
        message: isConnected ? 'Conexão LDAP OK' : 'Falha na conexão LDAP'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao testar conexão'
      });
    }
  }
}
