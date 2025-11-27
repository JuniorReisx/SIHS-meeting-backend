import { Request, Response } from "express";
import User from "../models/user.models";
import bcrypt from "bcrypt";

export class UserController {
  private readonly SALT_ROUNDS = 12;
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly MIN_USERNAME_LENGTH = 3;

  private validateUsername(username: string): {
    valid: boolean;
    error?: string;
  } {
    if (!username || username.trim().length < this.MIN_USERNAME_LENGTH) {
      return {
        valid: false,
        error: `Username deve ter no mínimo ${this.MIN_USERNAME_LENGTH} caracteres`,
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        valid: false,
        error: "Username só pode conter letras, números, _ e -",
      };
    }

    return { valid: true };
  }

  private validatePassword(password: string): {
    valid: boolean;
    error?: string;
  } {
    if (!password || password.length < this.MIN_PASSWORD_LENGTH) {
      return {
        valid: false,
        error: `Senha deve ter no mínimo ${this.MIN_PASSWORD_LENGTH} caracteres`,
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      return {
        valid: false,
        error:
          "Senha deve conter: maiúscula, minúscula, número e caractere especial",
      };
    }

    return { valid: true };
  }

  private validateSetor(setor: string): { valid: boolean; error?: string } {
    if (!setor || setor.trim().length === 0) {
      return {
        valid: false,
        error: "Setor é obrigatório",
      };
    }

    return { valid: true };
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  private async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username e password são obrigatórios",
        });
      }

      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      const { password: _, ...userWithoutPassword } = user.toJSON();

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password, setor } = req.body;

      if (!username || !password || !setor) {
        return res.status(400).json({
          success: false,
          message: "Username, password e setor são obrigatórios",
        });
      }

      const usernameValidation = this.validateUsername(username);
      if (!usernameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: usernameValidation.error,
        });
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
        });
      }

      const setorValidation = this.validateSetor(setor);
      if (!setorValidation.valid) {
        return res.status(400).json({
          success: false,
          message: setorValidation.error,
        });
      }

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Username já existe",
        });
      }

      const hashedPassword = await this.hashPassword(password);

      const user = await User.create({
        username,
        password: hashedPassword,
        setor,
      });

      const { password: _, ...userWithoutPassword } = user.toJSON();

      return res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findByUsername(req: Request, res: Response): Promise<Response> {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username é obrigatório",
        });
      }

      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findBySetor(req: Request, res: Response): Promise<Response> {
    try {
      const { setor } = req.params;

      if (!setor) {
        return res.status(400).json({
          success: false,
          message: "Setor é obrigatório",
        });
      }

      const users = await User.findAll({
        where: { setor },
        attributes: { exclude: ["password"] },
        order: [["username", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      console.error("Erro ao buscar usuários por setor:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updateSetor(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { setor } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      if (!setor) {
        return res.status(400).json({
          success: false,
          message: "Setor é obrigatório",
        });
      }

      const setorValidation = this.validateSetor(setor);
      if (!setorValidation.valid) {
        return res.status(400).json({
          success: false,
          message: setorValidation.error,
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      user.setor = setor;
      await user.save();

      const { password: _, ...userWithoutPassword } = user.toJSON();

      return res.status(200).json({
        success: true,
        message: "Setor atualizado com sucesso",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Erro ao atualizar setor:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async updatePassword(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "Nova senha é obrigatória",
        });
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      const hashedPassword = await this.hashPassword(newPassword);

      user.password = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Senha atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      await user.destroy();

      return res.status(200).json({
        success: true,
        message: "Usuário deletado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

export const userController = new UserController();
