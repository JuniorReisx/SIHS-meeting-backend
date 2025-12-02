import { supabase } from "../config/supabase";
import type {
  MeetingTypes,
  CreateMeetingInput,
  UpdateMeetingInput,
} from "../types/auth.types";

export class Meeting {
  static async create(data: CreateMeetingInput): Promise<MeetingTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from("meetings")
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar reunião:", error);
        return null;
      }

      return meeting as MeetingTypes;
    } catch (error) {
      console.error("Erro ao criar reunião:", error);
      return null;
    }
  }

  static async findAll(): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões:", error);
      return [];
    }
  }

  static async findById(id: number): Promise<MeetingTypes | null> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erro ao buscar reunião:", error);
        return null;
      }

      return data as MeetingTypes;
    } catch (error) {
      console.error("Erro ao buscar reunião:", error);
      return null;
    }
  }

  static async update(
    id: number,
    data: UpdateMeetingInput
  ): Promise<MeetingTypes | null> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: meeting, error } = await supabase
        .from("meetings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar reunião:", error);
        return null;
      }

      return meeting as MeetingTypes;
    } catch (error) {
      console.error("Erro ao atualizar reunião:", error);
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from("meetings").delete().eq("id", id);

      if (error) {
        console.error("Erro ao deletar reunião:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao deletar reunião:", error);
      return false;
    }
  }

  static async findByDate(date: string): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("meeting_date", date)
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões por data:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões por data:", error);
      return [];
    }
  }

  static async findByLocation(location: string): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .ilike("location", `%${location}%`)
        .order("meeting_date", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões por local:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões por local:", error);
      return [];
    }
  }

  static async findUpcoming(): Promise<MeetingTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .gte("meeting_date", today)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões futuras:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões futuras:", error);
      return [];
    }
  }

  static async findPast(): Promise<MeetingTypes[]> {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .lt("meeting_date", today)
        .order("meeting_date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reuniões passadas:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões passadas:", error);
      return [];
    }
  }

  static async findByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .gte("meeting_date", startDate)
        .lte("meeting_date", endDate)
        .order("meeting_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Erro ao buscar reuniões por intervalo:", error);
        return [];
      }

      return (data as MeetingTypes[]) || [];
    } catch (error) {
      console.error("Erro ao buscar reuniões por intervalo:", error);
      return [];
    }
  }
}

export default Meeting;
