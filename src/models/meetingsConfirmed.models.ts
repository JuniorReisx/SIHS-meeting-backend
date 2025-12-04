import { supabase } from "../config/supabase";
import type {
  MeetingConfirmedTypes,
  CreateMeetingConfirmedInput,
  UpdateMeetingConfirmedInput,
} from "../types/auth.types";

export class MeetingConfirmed {
  static async create(data: CreateMeetingConfirmedInput): Promise<MeetingConfirmedTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from("meetings_confirmed")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar reunião confirmada:", error);
        return null;
      }

      return meeting as MeetingConfirmedTypes;
    } catch (error) {
      console.error("Erro ao criar reunião confirmada:", error);
      return null;
    }
  }

  static async findAll(): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas:", error);
      return [];
    }
  }

  static async findById(id: number): Promise<MeetingConfirmedTypes | null> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar reunião confirmada:", error);
        return null;
      }

      return data as MeetingConfirmedTypes;
    } catch (error) {
      console.error("Erro ao buscar reunião confirmada:", error);
      return null;
    }
  }

  static async update(
    id: number,
    data: UpdateMeetingConfirmedInput
  ): Promise<MeetingConfirmedTypes | null> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: meeting, error } = await supabase
        .from("meetings_confirmed")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar reunião confirmada:", error);
        return null;
      }

      return meeting as MeetingConfirmedTypes;
    } catch (error) {
      console.error("Erro ao atualizar reunião confirmada:", error);
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("meetings_confirmed")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar reunião confirmada:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao deletar reunião confirmada:", error);
      return false;
    }
  }

  static async findByDate(date: string): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .eq("meeting_date", date)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas por data:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas por data:", error);
      return [];
    }
  }

  static async findByLocation(location: string): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .ilike("location", `%${location}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas por local:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas por local:", error);
      return [];
    }
  }

  static async findByResponsible(responsible: string): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .ilike("responsible", `%${responsible}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas por responsável:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas por responsável:", error);
      return [];
    }
  }

  static async findByDepartment(department: string): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .ilike("responsible_department", `%${department}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas por departamento:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas por departamento:", error);
      return [];
    }
  }

  static async findUpcoming(): Promise<MeetingConfirmedTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas futuras:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas futuras:", error);
      return [];
    }
  }

  static async findPast(): Promise<MeetingConfirmedTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .lt("meeting_date", today)
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas passadas:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas passadas:", error);
      return [];
    }
  }

  static async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MeetingConfirmedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_confirmed")
        .select("*")
        .gte("meeting_date", startDate)
        .lte("meeting_date", endDate)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões confirmadas por intervalo:", error);
        return [];
      }

      return (data as MeetingConfirmedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões confirmadas por intervalo:", error);
      return [];
    }
  }
}

export default MeetingConfirmed;