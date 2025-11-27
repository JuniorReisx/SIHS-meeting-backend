import type { Request, Response, NextFunction } from "express";

export const validateLoginRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  const errors: string[] = [];

  if (!username || username.trim() === "") {
    errors.push("Usuário é obrigatório");
  }

  if (!password || password.trim() === "") {
    errors.push("Senha é obrigatória");
  }

  if (username && username.length < 3) {
    errors.push("Usuário deve ter no mínimo 3 caracteres");
  }

  if (password && password.length < 4) {
    errors.push("Senha deve ter no mínimo 4 caracteres");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Dados inválidos",
      errors,
    });
  }

  next();
};
