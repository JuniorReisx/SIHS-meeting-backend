import { supabase } from "../config/supabase";
import bcrypt from "bcrypt";
import { AdminTypes, AdminResponse } from "../types/auth.types";

export class Admin {
  private static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private static async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  // CREATE ADMIN
  static async create(username: string, password: string) {
    try {
      const hashedPassword = await this.hashPassword(password);

      const { data: admin, error } = await supabase
        .from("admins")
        .insert([{ username, password: hashedPassword }])
        .select()
        .single();

      if (error) return null;

      return admin as AdminTypes;
    } catch {
      return null;
    }
  }

  // LOGIN
  static async login(username: string, password: string) {
    try {
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !admin) return null;

      const isValid = await this.comparePassword(password, admin.password);
      if (!isValid) return null;

      const { password: _, ...adminWithoutPass } = admin;
      return adminWithoutPass;
    } catch {
      return null;
    }
  }

  // FIND BY ID
  static async findById(id: number): Promise<AdminResponse | null> {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id, username, created_at, updated_at")
        .eq("id", id)
        .single();

      if (error) return null;
      return data as AdminResponse;
    } catch {
      return null;
    }
  }

  // UPDATE PASSWORD
  static async updatePassword(id: number, newPassword: string) {
    try {
      const hashed = await this.hashPassword(newPassword);

      const { error } = await supabase
        .from("admins")
        .update({
          password: hashed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      return !error;
    } catch {
      return false;
    }
  }

  // DELETE
  static async delete(id: number) {
    try {
      const { error } = await supabase
        .from("admins")
        .delete()
        .eq("id", id);

      return !error;
    } catch {
      return false;
    }
  }

  // FIND ALL
  static async findAll(): Promise<AdminResponse[]> {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("id, username, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) return [];

      return data as AdminResponse[];
    } catch {
      return [];
    }
  }
}

export default Admin;
