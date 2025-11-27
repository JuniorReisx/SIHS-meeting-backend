import { Request, Response } from "express";
import Meeting from "../models/meeting.models";

export class MeetingController {
  private readonly MIN_TITLE_LENGTH = 3;
  private readonly MAX_TITLE_LENGTH = 200;
  private readonly MIN_DESCRIPTION_LENGTH = 10;
  private readonly MIN_PARTICIPANTS = 1;

  private validateTitle(title: string): { valid: boolean; error?: string } {
    if (!title || title.trim().length < this.MIN_TITLE_LENGTH) {
      return {
        valid: false,
        error: `Título deve ter no mínimo ${this.MIN_TITLE_LENGTH} caracteres`,
      };
    }

    if (title.length > this.MAX_TITLE_LENGTH) {
      return {
        valid: false,
        error: `Título deve ter no máximo ${this.MAX_TITLE_LENGTH} caracteres`,
      };
    }

    return { valid: true };
  }

  private validateDate(data: string): { valid: boolean; error?: string } {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!data || !dateRegex.test(data)) {
      return {
        valid: false,
        error: "Data deve estar no formato YYYY-MM-DD",
      };
    }

    const meetingDate = new Date(data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (meetingDate < today) {
      return {
        valid: false,
        error: "Data não pode ser no passado",
      };
    }

    return { valid: true };
  }

  private validateTime(time: string): { valid: boolean; error?: string } {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

    if (!time || !timeRegex.test(time)) {
      return {
        valid: false,
        error: "Horário deve estar no formato HH:MM ou HH:MM:SS",
      };
    }

    return { valid: true };
  }

  private validateTimeRange(
    inicialHora: string,
    finalHora: string
  ): { valid: boolean; error?: string } {
    const inicial = inicialHora.split(":").map(Number);
    const final = finalHora.split(":").map(Number);

    const inicialMinutes = inicial[0] * 60 + inicial[1];
    const finalMinutes = final[0] * 60 + final[1];

    if (finalMinutes <= inicialMinutes) {
      return {
        valid: false,
        error: "Horário final deve ser posterior ao horário inicial",
      };
    }

    return { valid: true };
  }

  private validateDescription(descricao: string): {
    valid: boolean;
    error?: string;
  } {
    if (!descricao || descricao.trim().length < this.MIN_DESCRIPTION_LENGTH) {
      return {
        valid: false,
        error: `Descrição deve ter no mínimo ${this.MIN_DESCRIPTION_LENGTH} caracteres`,
      };
    }

    return { valid: true };
  }

  private validateParticipants(qparticipants: number): {
    valid: boolean;
    error?: string;
  } {
    if (!qparticipants || qparticipants < this.MIN_PARTICIPANTS) {
      return {
        valid: false,
        error: `Quantidade de participantes deve ser no mínimo ${this.MIN_PARTICIPANTS}`,
      };
    }

    if (!Number.isInteger(qparticipants)) {
      return {
        valid: false,
        error: "Quantidade de participantes deve ser um número inteiro",
      };
    }

    return { valid: true };
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        title,
        data,
        inicialHora,
        finalHora,
        local,
        qparticipants,
        descricao,
      } = req.body;

      if (
        !title ||
        !data ||
        !inicialHora ||
        !finalHora ||
        !local ||
        !qparticipants ||
        !descricao
      ) {
        return res.status(400).json({
          success: false,
          message: "Todos os campos são obrigatórios",
        });
      }

      const titleValidation = this.validateTitle(title);
      if (!titleValidation.valid) {
        return res.status(400).json({
          success: false,
          message: titleValidation.error,
        });
      }

      const dateValidation = this.validateDate(data);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error,
        });
      }

      const inicialHoraValidation = this.validateTime(inicialHora);
      if (!inicialHoraValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Horário inicial inválido: ${inicialHoraValidation.error}`,
        });
      }

      const finalHoraValidation = this.validateTime(finalHora);
      if (!finalHoraValidation.valid) {
        return res.status(400).json({
          success: false,
          message: `Horário final inválido: ${finalHoraValidation.error}`,
        });
      }

      const timeRangeValidation = this.validateTimeRange(
        inicialHora,
        finalHora
      );
      if (!timeRangeValidation.valid) {
        return res.status(400).json({
          success: false,
          message: timeRangeValidation.error,
        });
      }

      const descriptionValidation = this.validateDescription(descricao);
      if (!descriptionValidation.valid) {
        return res.status(400).json({
          success: false,
          message: descriptionValidation.error,
        });
      }

      const participantsValidation = this.validateParticipants(
        Number(qparticipants)
      );
      if (!participantsValidation.valid) {
        return res.status(400).json({
          success: false,
          message: participantsValidation.error,
        });
      }

      const meeting = await Meeting.create({
        title: title.trim(),
        data,
        inicialHora,
        finalHora,
        local: local.trim(),
        qparticipants: Number(qparticipants),
        descricao: descricao.trim(),
      });

      return res.status(201).json({
        success: true,
        message: "Reunião criada com sucesso",
        data: meeting,
      });
    } catch (error) {
      console.error("Erro ao criar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      const meetings = await Meeting.findAll({
        order: [
          ["data", "ASC"],
          ["inicialHora", "ASC"],
        ],
      });

      return res.status(200).json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      console.error("Erro ao listar reuniões:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const meeting = await Meeting.findByPk(id);

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        data: meeting,
      });
    } catch (error) {
      console.error("Erro ao buscar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const {
        title,
        data,
        inicialHora,
        finalHora,
        local,
        qparticipants,
        descricao,
      } = req.body;

      const meeting = await Meeting.findByPk(id);

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada",
        });
      }

      if (title !== undefined) {
        const titleValidation = this.validateTitle(title);
        if (!titleValidation.valid) {
          return res.status(400).json({
            success: false,
            message: titleValidation.error,
          });
        }
        meeting.title = title.trim();
      }

      if (data !== undefined) {
        const dateValidation = this.validateDate(data);
        if (!dateValidation.valid) {
          return res.status(400).json({
            success: false,
            message: dateValidation.error,
          });
        }
        meeting.data = new Date(data);
      }

      if (inicialHora !== undefined) {
        const inicialHoraValidation = this.validateTime(inicialHora);
        if (!inicialHoraValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `Horário inicial inválido: ${inicialHoraValidation.error}`,
          });
        }
        meeting.inicialHora = inicialHora;
      }

      if (finalHora !== undefined) {
        const finalHoraValidation = this.validateTime(finalHora);
        if (!finalHoraValidation.valid) {
          return res.status(400).json({
            success: false,
            message: `Horário final inválido: ${finalHoraValidation.error}`,
          });
        }
        meeting.finalHora = finalHora;
      }

      if (inicialHora !== undefined || finalHora !== undefined) {
        const timeRangeValidation = this.validateTimeRange(
          meeting.inicialHora,
          meeting.finalHora
        );
        if (!timeRangeValidation.valid) {
          return res.status(400).json({
            success: false,
            message: timeRangeValidation.error,
          });
        }
      }

      if (local !== undefined) {
        meeting.local = local.trim();
      }

      if (qparticipants !== undefined) {
        const participantsValidation = this.validateParticipants(
          Number(qparticipants)
        );
        if (!participantsValidation.valid) {
          return res.status(400).json({
            success: false,
            message: participantsValidation.error,
          });
        }
        meeting.qparticipants = Number(qparticipants);
      }

      if (descricao !== undefined) {
        const descriptionValidation = this.validateDescription(descricao);
        if (!descriptionValidation.valid) {
          return res.status(400).json({
            success: false,
            message: descriptionValidation.error,
          });
        }
        meeting.descricao = descricao.trim();
      }

      await meeting.save();

      return res.status(200).json({
        success: true,
        message: "Reunião atualizada com sucesso",
        data: meeting,
      });
    } catch (error) {
      console.error("Erro ao atualizar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const meeting = await Meeting.findByPk(id);

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada",
        });
      }

      await meeting.destroy();

      return res.status(200).json({
        success: true,
        message: "Reunião deletada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao deletar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }

  async findByDate(req: Request, res: Response): Promise<Response> {
    try {
      const { data } = req.params;

      const dateValidation = this.validateDate(data);
      if (!dateValidation.valid) {
        return res.status(400).json({
          success: false,
          message: dateValidation.error,
        });
      }

      const meetings = await Meeting.findAll({
        where: { data },
        order: [["inicialHora", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        data: meetings,
      });
    } catch (error) {
      console.error("Erro ao buscar reuniões por data:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  }
}

export const meetingController = new MeetingController();
