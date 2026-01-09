import type { Request, Response } from "express";
import { MeetingConfirmed } from "../../models/meetingsConfirmed.models";
import { MeetingPending } from "../../models/meetingsPending.models";
import { MeetingDenied } from "../../models/meetingsDenied.models";

export class MeetingsTotalController {
  // READ ALL
  async findAll(req: Request, res: Response) {
  try {
    console.log("Buscando confirmed...");
    const confirmed = await MeetingConfirmed.findAll();
    console.log("Confirmed encontrados:", confirmed.length);

    console.log("Buscando pending...");
    const pending = await MeetingPending.findAll();
    console.log("Pending encontrados:", pending.length);

    console.log("Buscando denied...");
    const denied = await MeetingDenied.findAll();
    console.log("Denied encontrados:", denied.length);

    const allMeetings = [
      ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
      ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
      ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
    ];

    console.log("Total de reuniões:", allMeetings.length);

    return res.status(200).json({
      success: true,
      message: "All meetings retrieved successfully",
      data: allMeetings,
      count: allMeetings.length,
      breakdown: {
        confirmed: confirmed.length,
        pending: pending.length,
        denied: denied.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching all meetings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching all meetings",
      error: error.message
    });
  }
}

  // ÚLTIMOS 10 DIAS
  async findLast10Days(req: Request, res: Response) {
    try {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const dateStr = tenDaysAgo.toISOString().split("T")[0];

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingPending.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingDenied.findByDateRange(dateStr, new Date().toISOString().split("T")[0])
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Meetings from last 10 days retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        period: "last_10_days",
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings from last 10 days:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings from last 10 days",
      });
    }
  }

  // ÚLTIMOS 20 DIAS
  async findLast20Days(req: Request, res: Response) {
    try {
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
      const dateStr = twentyDaysAgo.toISOString().split("T")[0];

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingPending.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingDenied.findByDateRange(dateStr, new Date().toISOString().split("T")[0])
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Meetings from last 20 days retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        period: "last_20_days",
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings from last 20 days:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings from last 20 days",
      });
    }
  }

  // ÚLTIMO MÊS
  async findLastMonth(req: Request, res: Response) {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const dateStr = oneMonthAgo.toISOString().split("T")[0];

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingPending.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingDenied.findByDateRange(dateStr, new Date().toISOString().split("T")[0])
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Meetings from last month retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        period: "last_month",
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings from last month:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings from last month",
      });
    }
  }

  // ÚLTIMO ANO
  async findLastYear(req: Request, res: Response) {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateStr = oneYearAgo.toISOString().split("T")[0];

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingPending.findByDateRange(dateStr, new Date().toISOString().split("T")[0]),
        MeetingDenied.findByDateRange(dateStr, new Date().toISOString().split("T")[0])
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Meetings from last year retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        period: "last_year",
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings from last year:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings from last year",
      });
    }
  }

  // POR MÊS ESPECÍFICO
  async findByMonth(req: Request, res: Response) {
    try {
      const { month } = req.params;
      
      if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Invalid month format. Use YYYY-MM (e.g., 2024-01)"
        });
      }

      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay}`;

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(startDate, endDate),
        MeetingPending.findByDateRange(startDate, endDate),
        MeetingDenied.findByDateRange(startDate, endDate)
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: `Meetings from ${month} retrieved successfully`,
        data: allMeetings,
        count: allMeetings.length,
        period: month,
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings by month:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings by month",
      });
    }
  }

  // RANGE DE DATAS
  async findByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "startDate and endDate are required (format: YYYY-MM-DD)"
        });
      }

      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findByDateRange(startDate as string, endDate as string),
        MeetingPending.findByDateRange(startDate as string, endDate as string),
        MeetingDenied.findByDateRange(startDate as string, endDate as string)
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Meetings within date range retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        period: { start: startDate, end: endDate },
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching meetings by date range:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings by date range",
      });
    }
  }

  // POR STATUS
  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;

      if (!['confirmed', 'pending', 'denied'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use: confirmed, pending, or denied"
        });
      }

      let meetings: any[] = [];
      
      switch (status) {
        case 'confirmed':
          meetings = await MeetingConfirmed.findAll();
          break;
        case 'pending':
          meetings = await MeetingPending.findAll();
          break;
        case 'denied':
          meetings = await MeetingDenied.findAll();
          break;
        default:
          meetings = [];
      }

      const result = meetings.map(meeting => ({ ...meeting, status }));

      return res.status(200).json({
        success: true,
        message: `${status} meetings retrieved successfully`,
        data: result,
        count: result.length,
        status
      });
    } catch (error: any) {
      console.error("Error fetching meetings by status:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching meetings by status",
      });
    }
  }

  // ESTATÍSTICAS
  async getStatistics(req: Request, res: Response) {
    try {
      const [confirmed, pending, denied] = await Promise.all([
        MeetingConfirmed.findAll(),
        MeetingPending.findAll(),
        MeetingDenied.findAll()
      ]);

      const total = confirmed.length + pending.length + denied.length;

      return res.status(200).json({
        success: true,
        message: "Statistics retrieved successfully",
        data: {
          total,
          confirmed: confirmed.length,
          pending: pending.length,
          denied: denied.length,
          percentages: {
            confirmed: total > 0 ? ((confirmed.length / total) * 100).toFixed(2) : 0,
            pending: total > 0 ? ((pending.length / total) * 100).toFixed(2) : 0,
            denied: total > 0 ? ((denied.length / total) * 100).toFixed(2) : 0
          }
        }
      });
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching statistics",
      });
    }
  }

  // PRÓXIMAS
  async findUpcoming(req: Request, res: Response) {
    try {
      const [confirmed, pending] = await Promise.all([
        MeetingConfirmed.findUpcoming(),
        MeetingPending.findUpcoming()
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...pending.map(meeting => ({ ...meeting, status: 'pending' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Upcoming meetings retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        breakdown: {
          confirmed: confirmed.length,
          pending: pending.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching upcoming meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching upcoming meetings",
      });
    }
  }

  // PASSADAS
  async findPast(req: Request, res: Response) {
    try {
      const [confirmed, denied] = await Promise.all([
        MeetingConfirmed.findPast(),
        MeetingDenied.findPast()
      ]);

      const allMeetings = [
        ...confirmed.map(meeting => ({ ...meeting, status: 'confirmed' })),
        ...denied.map(meeting => ({ ...meeting, status: 'denied' }))
      ];

      return res.status(200).json({
        success: true,
        message: "Past meetings retrieved successfully",
        data: allMeetings,
        count: allMeetings.length,
        breakdown: {
          confirmed: confirmed.length,
          denied: denied.length
        }
      });
    } catch (error: any) {
      console.error("Error fetching past meetings:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching past meetings",
      });
    }
  }
}