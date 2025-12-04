import { supabase } from "../config/supabase";
import type {
  MeetingPendingTypes,
  CreateMeetingPendingInput,
  UpdateMeetingPendingInput,
} from "../types/auth.types";

export class MeetingPending {
  static async create(data: CreateMeetingPendingInput): Promise<MeetingPendingTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from("meetings_pending")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar reunião pendente:", error);
        return null;
      }

      return meeting as MeetingPendingTypes;
    } catch (error) {
      console.error("Erro ao criar reunião pendente:", error);
      return null;
    }
  }

  static async findAll(): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes:", error);
      return [];
    }
  }

  static async findById(id: number): Promise<MeetingPendingTypes | null> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar reunião pendente:", error);
        return null;
      }

      return data as MeetingPendingTypes;
    } catch (error) {
      console.error("Erro ao buscar reunião pendente:", error);
      return null;
    }
  }

  static async update(
    id: number,
    data: UpdateMeetingPendingInput
  ): Promise<MeetingPendingTypes | null> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: meeting, error } = await supabase
        .from("meetings_pending")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar reunião pendente:", error);
        return null;
      }

      return meeting as MeetingPendingTypes;
    } catch (error) {
      console.error("Erro ao atualizar reunião pendente:", error);
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("meetings_pending")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar reunião pendente:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao deletar reunião pendente:", error);
      return false;
    }
  }

  static async findByDate(date: string): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .eq("meeting_date", date)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes por data:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes por data:", error);
      return [];
    }
  }

  static async findByLocation(location: string): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .ilike("location", `%${location}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes por local:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes por local:", error);
      return [];
    }
  }

  static async findByResponsible(responsible: string): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .ilike("responsible", `%${responsible}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes por responsável:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes por responsável:", error);
      return [];
    }
  }

  static async findByDepartment(department: string): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .ilike("responsible_department", `%${department}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes por departamento:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes por departamento:", error);
      return [];
    }
  }

  static async findUpcoming(): Promise<MeetingPendingTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes futuras:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes futuras:", error);
      return [];
    }
  }

  static async findPast(): Promise<MeetingPendingTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .lt("meeting_date", today)
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes passadas:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes passadas:", error);
      return [];
    }
  }

  static async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MeetingPendingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_pending")
        .select("*")
        .gte("meeting_date", startDate)
        .lte("meeting_date", endDate)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões pendentes por intervalo:", error);
        return [];
      }

      return (data as MeetingPendingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões pendentes por intervalo:", error);
      return [];
    }
  }
}

export default MeetingPending;