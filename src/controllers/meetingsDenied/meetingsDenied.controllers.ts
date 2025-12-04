import type { Request, Response } from "express";
import { MeetingDenied } from "../../models/meetingsDenied.models";

import type { UpdateMeetingDeniedInput } from "../../types/auth.types";

// ===== MEETING DENIED CONTROLLER =====
export class MeetingDeniedController {
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

      // Required fields validation
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
            "Required fields: title, meeting_date, start_time, end_time, location, participants_count, responsible, responsible_department",
        });
      }

      // Date validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(meeting_date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      // Time validation
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM or HH:MM:SS",
        });
      }

      // Participants count
      if (typeof participants_count !== "number" || participants_count < 0) {
        return res.status(400).json({
          success: false,
          message: "participants_count must be a number greater or equal to 0",
        });
      }

      const meeting = await MeetingDenied.create({
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
          message: "Error creating denied meeting",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Denied meeting created successfully",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Error creating denied meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Internal error creating denied meeting",
        error: error.message,
      });
    }
  }

  // ===== GET ALL =====
  async findAll(req: Request, res: Response) {
    try {
      const meetings = await MeetingDenied.findAll();

      return res.status(200).json({
        success: true,
        message: "Denied meetings retrieved successfully",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }

  // ===== GET BY ID =====
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      const meeting = await MeetingDenied.findById(Number(id));

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Denied meeting not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Denied meeting found",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Error fetching denied meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meeting",
      });
    }
  }

  // ===== UPDATE =====
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
          message: "Invalid ID",
        });
      }

      const existingMeeting = await MeetingDenied.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Denied meeting not found",
        });
      }

      const updateData: UpdateMeetingDeniedInput = {};

      if (title !== undefined) updateData.title = title;

      if (meeting_date !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(meeting_date)) {
          return res.status(400).json({
            success: false,
            message: "Invalid date format. Use YYYY-MM-DD",
          });
        }
        updateData.meeting_date = meeting_date;
      }

      if (start_time !== undefined) {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
        if (!timeRegex.test(start_time)) {
          return res.status(400).json({
            success: false,
            message: "Invalid start_time format. Use HH:MM or HH:MM:SS",
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
            message: "Invalid end_time format. Use HH:MM or HH:MM:SS",
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
            message: "participants_count must be >= 0",
          });
        }
        updateData.participants_count = participants_count;
      }

      if (description !== undefined) updateData.description = description;
      if (responsible !== undefined) updateData.responsible = responsible;
      if (responsible_department !== undefined)
        updateData.responsible_department = responsible_department;

      const updatedMeeting = await MeetingDenied.update(
        Number(id),
        updateData
      );

      if (!updatedMeeting) {
        return res.status(500).json({
          success: false,
          message: "Error updating denied meeting",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Denied meeting updated successfully",
        data: updatedMeeting,
      });
    } catch (error: any) {
      console.error("Error updating denied meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating denied meeting",
      });
    }
  }

  // ===== DELETE =====
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      const existingMeeting = await MeetingDenied.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Denied meeting not found",
        });
      }

      const deleted = await MeetingDenied.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Error deleting denied meeting",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Denied meeting deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting denied meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting denied meeting",
      });
    }
  }

  // ===== FIND BY DATE =====
  async findByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "Date is required",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      const meetings = await MeetingDenied.findByDate(date);

      return res.status(200).json({
        success: true,
        message: "Denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings by date:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }

  // ===== FIND BY LOCATION =====
  async findByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Location is required",
        });
      }

      const meetings = await MeetingDenied.findByLocation(location);

      return res.status(200).json({
        success: true,
        message: "Denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings by location:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }

  // ===== FIND BY RESPONSIBLE =====
  async findByResponsible(req: Request, res: Response) {
    try {
      const { responsible } = req.params;

      if (!responsible) {
        return res.status(400).json({
          success: false,
          message: "Responsible is required",
        });
      }

      const meetings = await MeetingDenied.findByResponsible(responsible);

      return res.status(200).json({
        success: true,
        message: "Denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings by responsible:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }

  // ===== FIND BY DEPARTMENT =====
  async findByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params;

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        });
      }

      const meetings = await MeetingDenied.findByDepartment(department);

      return res.status(200).json({
        success: true,
        message: "Denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings by department:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }

  // ===== UPCOMING =====
  async findUpcoming(req: Request, res: Response) {
    try {
      const meetings = await MeetingDenied.findUpcoming();

      return res.status(200).json({
        success: true,
        message: "Upcoming denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching upcoming denied meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching upcoming denied meetings",
      });
    }
  }

  // ===== PAST =====
  async findPast(req: Request, res: Response) {
    try {
      const meetings = await MeetingDenied.findPast();

      return res.status(200).json({
        success: true,
        message: "Past denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching past denied meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching past denied meetings",
      });
    }
  }

  // ===== DATE RANGE =====
  async findByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (
        !dateRegex.test(startDate as string) ||
        !dateRegex.test(endDate as string)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      const meetings = await MeetingDenied.findByDateRange(
        startDate as string,
        endDate as string
      );

      return res.status(200).json({
        success: true,
        message: "Denied meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching denied meetings by range:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching denied meetings",
      });
    }
  }
}
