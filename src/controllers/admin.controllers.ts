import type { Request, Response } from "express";
import { Admin } from "../models/admin.models";

export class AdminController {
  // Criar admin
  async create(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username e password são obrigatórios"
        });
      }

      const admin = await Admin.create(username, password);

      if (!admin) {
        return res.status(500).json({
          success: false,
          message: "Erro ao criar admin"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Admin criado com sucesso",
        data: {
          id: admin.id,
          username: admin.username,
          createdAt: admin.createdAt // ✅ Mudado de created_at para createdAt
        }
      });

    } catch (error: any) {
      console.error("Erro ao criar admin:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar admin"
      });
    }
  }

  // Login do admin
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username e password são obrigatórios"
        });
      }

      const admin = await Admin.login(username, password);

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: admin
      });

    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao fazer login"
      });
    }
  }

  // Buscar todos os admins
  async findAll(req: Request, res: Response) {
    try {
      const admins = await Admin.findAll();

      return res.status(200).json({
        success: true,
        message: "Admins recuperados com sucesso",
        data: admins,
        count: admins.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar admins:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar admins"
      });
    }
  }

  // Buscar admin por ID
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const admin = await Admin.findById(Number(id));

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin não encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin encontrado",
        data: admin
      });

    } catch (error: any) {
      console.error("Erro ao buscar admin:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar admin"
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "Nova senha é obrigatória"
        });
      }

      const existingAdmin = await Admin.findById(Number(id));
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: "Admin não encontrado"
        });
      }

      const updated = await Admin.updatePassword(Number(id), newPassword);

      if (!updated) {
        return res.status(500).json({
          success: false,
          message: "Erro ao atualizar senha"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Senha atualizada com sucesso"
      });

    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar senha"
      });
    }
  }

  // Deletar admin
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const existingAdmin = await Admin.findById(Number(id));
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: "Admin não encontrado"
        });
      }

      const deleted = await Admin.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Erro ao deletar admin"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Admin deletado com sucesso"
      });

    } catch (error: any) {
      console.error("Erro ao deletar admin:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao deletar admin"
      });
    }
  }
}

export const adminController = new AdminController();