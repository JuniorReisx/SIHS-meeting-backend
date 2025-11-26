import type { Request, Response } from "express";
import { User } from "../models/user.models.js";

export class UserController {
  // Criar usuário
  async create(req: Request, res: Response) {
    try {
      const { username, password, department } = req.body;

      if (!username || !password || !department) {
        return res.status(400).json({
          success: false,
          message: "Username, password e department são obrigatórios"
        });
      }

      // Verificar se username já existe
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username já está em uso"
        });
      }

      const user = await User.create(username, password, department);

      if (!user) {
        return res.status(500).json({
          success: false,
          message: "Erro ao criar usuário"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: {
          id: user.id,
          username: user.username,
          department: user.department,
          created_at: user.created_at
        }
      });

    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar usuário"
      });
    }
  }

  // Login do usuário
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username e password são obrigatórios"
        });
      }

      const user = await User.login(username, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: user
      });

    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao fazer login"
      });
    }
  }

  // Buscar todos os usuários
  async findAll(req: Request, res: Response) {
    try {
      const users = await User.findAll();

      return res.status(200).json({
        success: true,
        message: "Usuários recuperados com sucesso",
        data: users,
        count: users.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar usuários:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar usuários"
      });
    }
  }

  // Buscar usuário por ID
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const user = await User.findById(Number(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Usuário encontrado",
        data: user
      });

    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar usuário"
      });
    }
  }

  // Buscar usuário por username
  async findByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username é obrigatório"
        });
      }

      const user = await User.findByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Usuário encontrado",
        data: user
      });

    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar usuário"
      });
    }
  }

  // Buscar usuários por departamento
  async findByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params;

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department é obrigatório"
        });
      }

      const users = await User.findByDepartment(department);

      return res.status(200).json({
        success: true,
        message: "Usuários encontrados",
        data: users,
        count: users.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar usuários por departamento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar usuários"
      });
    }
  }

  // Atualizar departamento
  async updateDepartment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { department } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department é obrigatório"
        });
      }

      const existingUser = await User.findById(Number(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      const updatedUser = await User.updateDepartment(Number(id), department);

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          message: "Erro ao atualizar departamento"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Departamento atualizado com sucesso",
        data: updatedUser
      });

    } catch (error: any) {
      console.error("Erro ao atualizar departamento:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar departamento"
      });
    }
  }

  // Atualizar senha
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

      const existingUser = await User.findById(Number(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      const updated = await User.updatePassword(Number(id), newPassword);

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

  // Deletar usuário
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const existingUser = await User.findById(Number(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }

      const deleted = await User.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Erro ao deletar usuário"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Usuário deletado com sucesso"
      });

    } catch (error: any) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao deletar usuário"
      });
    }
  }
}

export const userController = new UserController();