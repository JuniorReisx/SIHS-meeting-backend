import type { Request, Response } from "express";
import { Meeting } from "../models/meeting.models";
import type { MeetingTypes } from "../types/auth.types";

export class MeetingController {
  async create(req: Request, res: Response) {
    try {
      const { title, date, time, location, participants, description } = req.body;

      if (!title || !date || !time || !location || !participants || !description) {
        return res.status(400).json({
          success: false,
          message: "Todos os campos são obrigatórios"
        });
      }

      const meeting = await Meeting.create({
        title,
        date,
        time,
        location,
        participants,
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
        message: "Erro interno ao criar reunião"
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
      const { title, date, time, location, participants, description } = req.body;

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

      const updateData: Partial<MeetingTypes> = {};
      if (title) updateData.title = title;
      if (date) updateData.date = date;
      if (time) updateData.time = time;
      if (location) updateData.location = location;
      if (participants) updateData.participants = participants;
      if (description) updateData.description = description;

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

  async findByParticipant(req: Request, res: Response) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Nome do participante é obrigatório"
        });
      }

      const meetings = await Meeting.findByParticipant(name);

      return res.status(200).json({
        success: true,
        message: "Reuniões encontradas",
        data: meetings,
        count: meetings.length
      });

    } catch (error: any) {
      console.error("Erro ao buscar reuniões por participante:", error);
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar reuniões"
      });
    }
  }
}

export const meetingController = new MeetingController();