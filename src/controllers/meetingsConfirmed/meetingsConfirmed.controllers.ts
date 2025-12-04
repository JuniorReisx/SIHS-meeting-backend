import type { Request, Response } from "express";
import { MeetingConfirmed } from "../../models/meetingsConfirmed.models";

import type {
  UpdateMeetingConfirmedInput,
} from "../../types/auth.types";

// ===== MEETING CONFIRMED CONTROLLER =====
export class MeetingConfirmedController {
  async create(req: Request, res: Response) {
    try {
      const {
        title,
        meeting_date,
        start_time,
        end_time,
        location,
        participants_count,
        description,
        responsible,
        responsible_department,
      } = req.body;

      if (
        !title ||
        !meeting_date ||
        !start_time ||
        !end_time ||
        !location ||
        participants_count === undefined ||
        !responsible ||
        !responsible_department
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Campos obrigatórios: title, meeting_date, start_time, end_time, location, participants_count, responsible, responsible_department",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(meeting_date)) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD",
        });
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Formato de hora inválido. Use HH:MM ou HH:MM:SS",
        });
      }

      if (typeof participants_count !== "number" || participants_count < 0) {
        return res.status(400).json({
          success: false,
          message: "participants_count deve ser um número maior ou igual a 0",
        });
      }

      const meeting = await MeetingConfirmed.create({
        title,
        meeting_date,
        start_time: start_time.length === 5 ? `${start_time}:00` : start_time,
        end_time: end_time.length === 5 ? `${end_time}:00` : end_time,
        location,
        participants_count,
        description,
        responsible,
        responsible_department,
      });

      if (!meeting) {
        return res.status(500).json({
          success: false,
          message: "Erro ao criar reunião confirmada",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Reunião confirmada criada com sucesso",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Erro ao criar reunião confirmada:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar reunião confirmada",
        error: error.message,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const meetings = await MeetingConfirmed.findAll();

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas recuperadas com sucesso",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reuniões confirmadas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const meeting = await MeetingConfirmed.findById(Number(id));

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião confirmada não encontrada",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião confirmada encontrada",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reunião confirmada:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reunião confirmada",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        meeting_date,
        start_time,
        end_time,
        location,
        participants_count,
        description,
        responsible,
        responsible_department,
      } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const existingMeeting = await MeetingConfirmed.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião confirmada não encontrada",
        });
      }

      const updateData: UpdateMeetingConfirmedInput = {};

      if (title !== undefined) updateData.title = title;
      if (meeting_date !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(meeting_date)) {
          return res.status(400).json({
            success: false,
            message: "Formato de data inválido. Use YYYY-MM-DD",
          });
        }
        updateData.meeting_date = meeting_date;
      }
      if (start_time !== undefined) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        if (!timeRegex.test(start_time)) {
          return res.status(400).json({
            success: false,
            message: "Formato de start_time inválido. Use HH:MM ou HH:MM:SS",
          });
        }
        updateData.start_time =
          start_time.length === 5 ? `${start_time}:00` : start_time;
      }
      if (end_time !== undefined) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        if (!timeRegex.test(end_time)) {
          return res.status(400).json({
            success: false,
            message: "Formato de end_time inválido. Use HH:MM ou HH:MM:SS",
          });
        }
        updateData.end_time =
          end_time.length === 5 ? `${end_time}:00` : end_time;
      }
      if (location !== undefined) updateData.location = location;
      if (participants_count !== undefined) {
        if (typeof participants_count !== "number" || participants_count < 0) {
          return res.status(400).json({
            success: false,
            message: "participants_count deve ser um número maior ou igual a 0",
          });
        }
        updateData.participants_count = participants_count;
      }
      if (description !== undefined) updateData.description = description;
      if (responsible !== undefined) updateData.responsible = responsible;
      if (responsible_department !== undefined)
        updateData.responsible_department = responsible_department;

      const updatedMeeting = await MeetingConfirmed.update(
        Number(id),
        updateData
      );

      if (!updatedMeeting) {
        return res.status(500).json({
          success: false,
          message: "Erro ao atualizar reunião confirmada",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião confirmada atualizada com sucesso",
        data: updatedMeeting,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar reunião confirmada:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar reunião confirmada",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido",
        });
      }

      const existingMeeting = await MeetingConfirmed.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião confirmada não encontrada",
        });
      }

      const deleted = await MeetingConfirmed.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Erro ao deletar reunião confirmada",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião confirmada deletada com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao deletar reunião confirmada:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao deletar reunião confirmada",
      });
    }
  }

  async findByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Data é obrigatória",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD",
        });
      }

      const meetings = await MeetingConfirmed.findByDate(date);

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reuniões confirmadas por data:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }

  async findByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Local é obrigatório",
        });
      }

      const meetings = await MeetingConfirmed.findByLocation(location);

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reuniões confirmadas por local:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }

  async findByResponsible(req: Request, res: Response) {
    try {
      const { responsible } = req.params;

      if (!responsible) {
        return res.status(400).json({
          success: false,
          message: "Responsável é obrigatório",
        });
      }

      const meetings = await MeetingConfirmed.findByResponsible(responsible);

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error(
        "Erro ao buscar reuniões confirmadas por responsável:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }

  async findByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params;

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Departamento é obrigatório",
        });
      }

      const meetings = await MeetingConfirmed.findByDepartment(department);

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error(
        "Erro ao buscar reuniões confirmadas por departamento:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }

  async findUpcoming(req: Request, res: Response) {
    try {
      const meetings = await MeetingConfirmed.findUpcoming();

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas futuras encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reuniões confirmadas futuras:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas futuras",
      });
    }
  }

  async findPast(req: Request, res: Response) {
    try {
      const meetings = await MeetingConfirmed.findPast();

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas passadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Erro ao buscar reuniões confirmadas passadas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas passadas",
      });
    }
  }

  async findByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate e endDate são obrigatórios",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (
        !dateRegex.test(startDate as string) ||
        !dateRegex.test(endDate as string)
      ) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD",
        });
      }

      const meetings = await MeetingConfirmed.findByDateRange(
        startDate as string,
        endDate as string
      );

      return res.status(200).json({
        success: true,
        message: "Reuniões confirmadas encontradas",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error(
        "Erro ao buscar reuniões confirmadas por intervalo:",
        error
      );
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões confirmadas",
      });
    }
  }
}