import type { Request, Response } from "express";
import { Meeting } from "../models/meeting.models";
import type { UpdateMeetingInput } from "../types/auth.types";

export class MeetingController {
  async create(req: Request, res: Response) {
    try {
      const { 
        title, 
        meeting_date, 
        start_time, 
        end_time, 
        location, 
        participants_count, 
        description 
      } = req.body;

      // Validação dos campos obrigatórios
      if (!title || !meeting_date || !start_time || !end_time || !location || participants_count === undefined) {
        return res.status(400).json({
          success: false,
          message: "Campos obrigatórios: title, meeting_date, start_time, end_time, location, participants_count"
        });
      }

      // Validação de formato de data (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(meeting_date)) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD"
        });
      }

      // Validação de formato de hora (HH:MM ou HH:MM:SS)
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Formato de hora inválido. Use HH:MM ou HH:MM:SS"
        });
      }

      // Validação de número de participantes
      if (typeof participants_count !== 'number' || participants_count < 0) {
        return res.status(400).json({
          success: false,
          message: "participants_count deve ser um número maior ou igual a 0"
        });
      }

      const meeting = await Meeting.create({
        title,
        meeting_date,
        start_time: start_time.length === 5 ? `${start_time}:00` : start_time,
        end_time: end_time.length === 5 ? `${end_time}:00` : end_time,
        location,
        participants_count,
        description
      });

      if (!meeting) {
        return res.status(500).json({
          success: false,
          message: "Erro ao criar reunião"
        });
      }

      return res.status(201).json({
        success: true,
        message: "Reunião criada com sucesso",
        data: meeting
      });

    } catch (error: any) {
      console.error("Erro ao criar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno ao criar reunião",
        error: error.message
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const meetings = await Meeting.findAll();

      return res.status(200).json({
        success: true,
        message: "Reuniões recuperadas com sucesso",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões"
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const meeting = await Meeting.findById(Number(id));

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião encontrada",
        data: meeting
      });

    } catch (error: any) {
      console.error("Erro ao buscar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reunião"
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
        description 
      } = req.body;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const existingMeeting = await Meeting.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada"
        });
      }

      const updateData: UpdateMeetingInput = {};
      
      if (title !== undefined) updateData.title = title;
      if (meeting_date !== undefined) {
        // Validação de formato de data
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(meeting_date)) {
          return res.status(400).json({
            success: false,
            message: "Formato de data inválido. Use YYYY-MM-DD"
          });
        }
        updateData.meeting_date = meeting_date;
      }
      if (start_time !== undefined) {
        // Validação de formato de hora
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        if (!timeRegex.test(start_time)) {
          return res.status(400).json({
            success: false,
            message: "Formato de start_time inválido. Use HH:MM ou HH:MM:SS"
          });
        }
        updateData.start_time = start_time.length === 5 ? `${start_time}:00` : start_time;
      }
      if (end_time !== undefined) {
        // Validação de formato de hora
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        if (!timeRegex.test(end_time)) {
          return res.status(400).json({
            success: false,
            message: "Formato de end_time inválido. Use HH:MM ou HH:MM:SS"
          });
        }
        updateData.end_time = end_time.length === 5 ? `${end_time}:00` : end_time;
      }
      if (location !== undefined) updateData.location = location;
      if (participants_count !== undefined) {
        if (typeof participants_count !== 'number' || participants_count < 0) {
          return res.status(400).json({
            success: false,
            message: "participants_count deve ser um número maior ou igual a 0"
          });
        }
        updateData.participants_count = participants_count;
      }
      if (description !== undefined) updateData.description = description;

      const updatedMeeting = await Meeting.update(Number(id), updateData);

      if (!updatedMeeting) {
        return res.status(500).json({
          success: false,
          message: "Erro ao atualizar reunião"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião atualizada com sucesso",
        data: updatedMeeting
      });

    } catch (error: any) {
      console.error("Erro ao atualizar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar reunião"
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "ID inválido"
        });
      }

      const existingMeeting = await Meeting.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Reunião não encontrada"
        });
      }

      const deleted = await Meeting.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Erro ao deletar reunião"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Reunião deletada com sucesso"
      });

    } catch (error: any) {
      console.error("Erro ao deletar reunião:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao deletar reunião"
      });
    }
  }

  async findByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Data é obrigatória"
        });
      }

      // Validação de formato de data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD"
        });
      }

      const meetings = await Meeting.findByDate(date);

      return res.status(200).json({
        success: true,
        message: "Reuniões encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões por data:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões"
      });
    }
  }

  async findByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Local é obrigatório"
        });
      }

      const meetings = await Meeting.findByLocation(location);

      return res.status(200).json({
        success: true,
        message: "Reuniões encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões por local:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões"
      });
    }
  }

  async findUpcoming(req: Request, res: Response) {
    try {
      const meetings = await Meeting.findUpcoming();

      return res.status(200).json({
        success: true,
        message: "Reuniões futuras encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões futuras:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões futuras"
      });
    }
  }

  async findPast(req: Request, res: Response) {
    try {
      const meetings = await Meeting.findPast();

      return res.status(200).json({
        success: true,
        message: "Reuniões passadas encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões passadas:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões passadas"
      });
    }
  }

  async findByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate e endDate são obrigatórios"
        });
      }

      // Validação de formato de data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
        return res.status(400).json({
          success: false,
          message: "Formato de data inválido. Use YYYY-MM-DD"
        });
      }

      const meetings = await Meeting.findByDateRange(startDate as string, endDate as string);

      return res.status(200).json({
        success: true,
        message: "Reuniões encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões por intervalo:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões"
      });
    }
  }
}

export const meetingController = new MeetingController();