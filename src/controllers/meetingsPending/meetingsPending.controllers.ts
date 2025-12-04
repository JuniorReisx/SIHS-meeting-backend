import type { Request, Response } from "express";
import { MeetingPending } from "../../models/meetingsPending.models";

import type { UpdateMeetingDeniedInput } from "../../types/auth.types";

// ===== MEETING PENDING CONTROLLER =====
export class MeetingPendingController {
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
            "Required fields: title, meeting_date, start_time, end_time, location, participants_count, responsible, responsible_department",
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(meeting_date)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
      if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Use HH:MM or HH:MM:SS",
        });
      }

      if (typeof participants_count !== "number" || participants_count < 0) {
        return res.status(400).json({
          success: false,
          message: "participants_count must be a number >= 0",
        });
      }

      const meeting = await MeetingPending.create({
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
          message: "Error creating pending meeting",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Pending meeting created successfully",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Error creating pending meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Internal error creating pending meeting",
        error: error.message,
      });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const meetings = await MeetingPending.findAll();

      return res.status(200).json({
        success: true,
        message: "Pending meetings retrieved successfully",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      const meeting = await MeetingPending.findById(Number(id));

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: "Pending meeting not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pending meeting found",
        data: meeting,
      });
    } catch (error: any) {
      console.error("Error fetching pending meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meeting",
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
          message: "Invalid ID",
        });
      }

      const existingMeeting = await MeetingPending.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Pending meeting not found",
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

      const updatedMeeting = await MeetingPending.update(
        Number(id),
        updateData
      );

      if (!updatedMeeting) {
        return res.status(500).json({
          success: false,
          message: "Error updating pending meeting",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pending meeting updated successfully",
        data: updatedMeeting,
      });
    } catch (error: any) {
      console.error("Error updating pending meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating pending meeting",
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      const existingMeeting = await MeetingPending.findById(Number(id));
      if (!existingMeeting) {
        return res.status(404).json({
          success: false,
          message: "Pending meeting not found",
        });
      }

      const deleted = await MeetingPending.delete(Number(id));

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: "Error deleting pending meeting",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Pending meeting deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting pending meeting:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting pending meeting",
      });
    }
  }

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

      const meetings = await MeetingPending.findByDate(date);

      return res.status(200).json({
        success: true,
        message: "Pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings by date:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }

  async findByLocation(req: Request, res: Response) {
    try {
      const { location } = req.params;

      if (!location) {
        return res.status(400).json({
          success: false,
          message: "Location is required",
        });
      }

      const meetings = await MeetingPending.findByLocation(location);

      return res.status(200).json({
        success: true,
        message: "Pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings by location:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }

  async findByResponsible(req: Request, res: Response) {
    try {
      const { responsible } = req.params;

      if (!responsible) {
        return res.status(400).json({
          success: false,
          message: "Responsible person is required",
        });
      }

      const meetings = await MeetingPending.findByResponsible(responsible);

      return res.status(200).json({
        success: true,
        message: "Pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings by responsible:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }

  async findByDepartment(req: Request, res: Response) {
    try {
      const { department } = req.params;

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Department is required",
        });
      }

      const meetings = await MeetingPending.findByDepartment(department);

      return res.status(200).json({
        success: true,
        message: "Pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings by department:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }

  async findUpcoming(req: Request, res: Response) {
    try {
      const meetings = await MeetingPending.findUpcoming();

      return res.status(200).json({
        success: true,
        message: "Upcoming pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching upcoming pending meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching upcoming pending meetings",
      });
    }
  }

  async findPast(req: Request, res: Response) {
    try {
      const meetings = await MeetingPending.findPast();

      return res.status(200).json({
        success: true,
        message: "Past pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching past pending meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching past pending meetings",
      });
    }
  }

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

      const meetings = await MeetingPending.findByDateRange(
        startDate as string,
        endDate as string
      );

      return res.status(200).json({
        success: true,
        message: "Pending meetings found",
        data: meetings,
        count: meetings.length,
      });
    } catch (error: any) {
      console.error("Error fetching pending meetings by range:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching pending meetings",
      });
    }
  }
}
