import { supabase } from '../config/supabase';
import crypto from 'crypto';

export interface UserTypes {
  id: number;
  username: string;
  password?: string;
  department: string;
  created_at?: string;
  updated_at?: string;
}

interface UserResponse {
  id: number;
  username: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export class User {
  // Hash simples da senha usando crypto nativo do Node
  private static hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  // Criar usuário
  static async create(username: string, password: string, department: string): Promise<UserTypes | null> {
    try {
      const hashedPassword = this.hashPassword(password);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{ username, password: hashedPassword, department }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        return null;
      }

      return user as UserTypes;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  }

  // Login do usuário
  static async login(username: string, password: string): Promise<Omit<UserTypes, 'password'> | null> {
    try {
      const hashedPassword = this.hashPassword(password);

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', hashedPassword)
        .single();

      if (error || !user) {
        console.error('Credenciais inválidas');
        return null;
      }

      // Retornar usuário sem a senha
      const { password: _, ...userWithoutPassword } = user as UserTypes;
      return userWithoutPassword;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  }

  // Buscar usuário por username
  static async findByUsername(username: string): Promise<UserResponse | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, department, created_at, updated_at')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      }

      return data as UserResponse;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Buscar usuário por ID
  static async findById(id: number): Promise<UserResponse | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, department, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
      }

      return data as UserResponse;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Buscar usuários por departamento
  static async findByDepartment(department: string): Promise<UserResponse[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, department, created_at, updated_at')
        .eq('department', department)
        .order('username', { ascending: true });

      if (error) {
        console.error('Erro ao buscar usuários por departamento:', error);
        return [];
      }

      return (data as UserResponse[]) || [];
    } catch (error) {
      console.error('Erro ao buscar usuários por departamento:', error);
      return [];
    }
  }

  // Atualizar departamento do usuário
  static async updateDepartment(id: number, department: string): Promise<UserResponse | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({ department, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, username, department, created_at, updated_at')
        .single();

      if (error) {
        console.error('Erro ao atualizar departamento:', error);
        return null;
      }

      return user as UserResponse;
    } catch (error) {
      console.error('Erro ao atualizar departamento:', error);
      return null;
    }
  }

  // Atualizar senha
  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = this.hashPassword(newPassword);

      const { error } = await supabase
        .from('users')
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

  // Deletar usuário
  static async delete(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  }

  // Listar todos os usuários
  static async findAll(): Promise<UserResponse[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, department, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
      }

      return (data as UserResponse[]) || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }
}

export default User;