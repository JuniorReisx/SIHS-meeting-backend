import { supabase } from "../config/supabase";
import type {
  MeetingDeniedTypes,
  CreateMeetingDeniedInput,
  UpdateMeetingDeniedInput,
} from "../types/auth.types";

export class MeetingDenied {
  static async create(data: CreateMeetingDeniedInput): Promise<MeetingDeniedTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from("meetings_denied")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar reunião negada:", error);
        return null;
      }

      return meeting as MeetingDeniedTypes;
    } catch (error) {
      console.error("Erro ao criar reunião negada:", error);
      return null;
    }
  }

  static async findAll(): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões negadas:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas:", error);
      return [];
    }
  }

  static async findById(id: number): Promise<MeetingDeniedTypes | null> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar reunião negada:", error);
        return null;
      }

      return data as MeetingDeniedTypes;
    } catch (error) {
      console.error("Erro ao buscar reunião negada:", error);
      return null;
    }
  }

  static async update(
    id: number,
    data: UpdateMeetingDeniedInput
  ): Promise<MeetingDeniedTypes | null> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: meeting, error } = await supabase
        .from("meetings_denied")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar reunião negada:", error);
        return null;
      }

      return meeting as MeetingDeniedTypes;
    } catch (error) {
      console.error("Erro ao atualizar reunião negada:", error);
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("meetings_denied")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao deletar reunião negada:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao deletar reunião negada:", error);
      return false;
    }
  }

  static async findByDate(date: string): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .eq("meeting_date", date)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões negadas por data:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas por data:", error);
      return [];
    }
  }

  static async findByLocation(location: string): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .ilike("location", `%${location}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões negadas por local:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas por local:", error);
      return [];
    }
  }

  static async findByResponsible(responsible: string): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .ilike("responsible", `%${responsible}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões negadas por responsável:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas por responsável:", error);
      return [];
    }
  }

  static async findByDepartment(department: string): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .ilike("responsible_department", `%${department}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões negadas por departamento:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas por departamento:", error);
      return [];
    }
  }

  static async findUpcoming(): Promise<MeetingDeniedTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões negadas futuras:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas futuras:", error);
      return [];
    }
  }

  static async findPast(): Promise<MeetingDeniedTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .lt("meeting_date", today)
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões negadas passadas:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas passadas:", error);
      return [];
    }
  }

  static async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MeetingDeniedTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings_denied")
        .select("*")
        .gte("meeting_date", startDate)
        .lte("meeting_date", endDate)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões negadas por intervalo:", error);
        return [];
      }

      return (data as MeetingDeniedTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões negadas por intervalo:", error);
      return [];
    }
  }
}

export default MeetingDenied;