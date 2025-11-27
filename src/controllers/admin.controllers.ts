import { Request, Response } from "express";
import Admin from "../models/admin.model";
import bcrypt from "bcrypt";

export class AdminController {
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

      const admin = await Admin.findOne({ where: { username } });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      const isPasswordValid = await this.comparePassword(
        password,
        admin.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Credenciais inválidas",
        });
      }

      const { password: _, ...adminWithoutPassword } = admin.toJSON();

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: adminWithoutPassword,
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
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username e password são obrigatórios",
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

      const existingAdmin = await Admin.findOne({ where: { username } });
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "Username já existe",
        });
      }

      const hashedPassword = await this.hashPassword(password);

      const admin = await Admin.create({
        username,
        password: hashedPassword,
      });

      const { password: _, ...adminWithoutPassword } = admin.toJSON();

      return res.status(201).json({
        success: true,
        message: "Administrador criado com sucesso",
        data: adminWithoutPassword,
      });
    } catch (error) {
      console.error("Erro ao criar admin:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const admins = await Admin.findAll({
        attributes: { exclude: ["password"] },
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      console.error("Erro ao listar admins:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const admin = await Admin.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrador não encontrado",
        });
      }

      return res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      console.error("Erro ao buscar admin:", error);
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

      // Validar campo obrigatório
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

      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrador não encontrado",
        });
      }

      const hashedPassword = await this.hashPassword(newPassword);

      // Atualizar senha
      admin.password = hashedPassword;
      await admin.save();

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

      const admin = await Admin.findByPk(id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Administrador não encontrado",
        });
      }

      await admin.destroy();

      return res.status(200).json({
        success: true,
        message: "Administrador deletado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar admin:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

export const adminController = new AdminController();
