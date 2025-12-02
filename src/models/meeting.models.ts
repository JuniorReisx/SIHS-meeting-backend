import { supabase } from '../config/supabase';
import type { MeetingTypes } from '../types/auth.types';

export class Meeting {
  // Criar reunião
  static async create(data: Omit<MeetingTypes, 'id'>): Promise<MeetingTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar reunião:', error);
        return null;
      }

      return meeting;
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      return null;
    }
  }

  // Buscar todas as reuniões
  static async findAll(): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar reuniões:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      return [];
    }
  }

  // Buscar reunião por ID
  static async findById(id: number): Promise<MeetingTypes | null> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar reunião:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar reunião:', error);
      return null;
    }
  }

  // Atualizar reunião
  static async update(id: number, data: Partial<MeetingTypes>): Promise<MeetingTypes | null> {
    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar reunião:', error);
        return null;
      }

      return meeting;
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      return null;
    }
  }

  // Deletar reunião
  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar reunião:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar reunião:', error);
      return false;
    }
  }

  // Buscar reuniões por data
  static async findByDate(date: string): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('date', date)
        .order('time', { ascending: true });

      if (error) {
        console.error('Erro ao buscar reuniões por data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões por data:', error);
      return [];
    }
  }

  // Buscar reuniões por participante
  static async findByParticipant(participant: string): Promise<MeetingTypes[]> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .ilike('participants', `%${participant}%`)
        .order('date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar reuniões por participante:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar reuniões por participante:', error);
      return [];
    }
  }
}

export default Meeting;