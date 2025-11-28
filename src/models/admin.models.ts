import { supabase } from '../config/supabase.js';
import crypto from 'crypto';
import { AdminTypes } from '../types/auth.types.js';
import { AdminResponse } from '../types/auth.types.js';

export class Admin {
  private static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  static async create(username: string, password: string): Promise<AdminTypes | null> {
    try {
      const hashedPassword = this.hashPassword(password);

      const { data: admin, error } = await supabase
        .from('admins')
        .insert([{ username, password: hashedPassword }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar admin:', error);
        return null;
      }

      return admin as AdminTypes;
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      return null;
    }
  }

  static async login(username: string, password: string): Promise<Omit<AdminTypes, 'password'> | null> {
    try {
      const hashedPassword = this.hashPassword(password);

      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single();

      if (error || !admin) {
        console.error('Credenciais inválidas');
        return null;
      }

      const { password: _, ...adminWithoutPassword } = admin as AdminTypes;
      return adminWithoutPassword;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  }

  static async findById(id: number): Promise<AdminResponse | null> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar admin:', error);
        return null;
      }

      return data as AdminResponse;
    } catch (error) {
      console.error('Erro ao buscar admin:', error);
      return null;
    }
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = this.hashPassword(newPassword);

      const { error } = await supabase
        .from('admins')
        .update({ password: hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return false;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar admin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar admin:', error);
      return false;
    }
  }

  static async findAll(): Promise<AdminResponse[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar admins:', error);
        return [];
      }

      return (data as AdminResponse[]) || [];
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
      return [];
    }
  }
}

export default Admin;