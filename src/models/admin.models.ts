import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';
import { AdminTypes } from '../types/auth.types';
import { AdminResponse } from '../types/auth.types';

export class Admin {
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static async create(username: string, password: string): Promise<AdminTypes | null> {
    try {
      const hashedPassword = await this.hashPassword(password);

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
      // Primeiro busca o usuário
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !admin) {
        console.error('Credenciais inválidas');
        return null;
      }

      // Depois compara a senha
      const isPasswordValid = await this.comparePassword(password, admin.password);
      
      if (!isPasswordValid) {
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
        .select('id, username, createdAt, updatedAt')
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
      const hashedPassword = await this.hashPassword(newPassword);

      const { error } = await supabase
        .from('admins')
        .update({ 
          password: hashedPassword, 
          updatedAt: new Date().toISOString()
        })
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
        .select('id, username, createdAt, updatedAt')
        .order('createdAt', { ascending: false }); // ✅ Usando createdAt com C maiúsculo

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