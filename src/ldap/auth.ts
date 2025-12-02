import ldap from "ldapjs";
import type { Client, SearchOptions } from "ldapjs";
import { LDAPConfig, LDAPUser } from "../types/auth.types";

export class LDAPAuthService {
  private config: LDAPConfig;

  constructor() {
    this.config = {
      url: process.env.LDAP_URL || "ldap://localhost:389",
      baseDN: process.env.LDAP_BASE_DN || "dc=empresa,dc=com",
      timeout: parseInt(process.env.LDAP_TIMEOUT || "5000"),
    };
  }

  /**
   * Autentica usuário no LDAP e retorna seus dados
   */
  async authenticate(username: string, password: string): Promise<LDAPUser> {
    // Validação básica
    if (!username || !password) {
      throw new Error("Usuário e senha são obrigatórios");
    }

    const client = this.createClient();

    try {
      // 1. Primeiro, busca o DN completo do usuário
      const userDN = await this.findUserDN(client, username);

      if (!userDN) {
        throw new Error("Usuário não encontrado no diretório");
      }

      // 2. Tenta fazer bind com as credenciais do usuário
      await this.bindUser(client, userDN, password);

      // 3. Busca informações completas do usuário
      const userData = await this.getUserData(client, userDN);

      return userData;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.closeClient(client);
    }
  }

  /**
   * Cria cliente LDAP com timeout
   */
  private createClient(): Client {
    return ldap.createClient({
      url: this.config.url,
      timeout: this.config.timeout,
      connectTimeout: this.config.timeout,
    });
  }

  /**
   * Busca o DN completo do usuário
   */
  private findUserDN(client: Client, username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const searchOptions: SearchOptions = {
        filter: `(|(uid=${username})(sAMAccountName=${username})(cn=${username}))`,
        scope: "sub",
        attributes: ["dn"],
      };

      client.search(this.config.baseDN, searchOptions, (err, res) => {
        if (err) return reject(err);

        let foundDN: string | null = null;

        res.on("searchEntry", (entry) => {
          foundDN = entry.objectName || null;
        });

        res.on("error", (err) => {
          reject(err);
        });

        res.on("end", () => {
          resolve(foundDN || "");
        });
      });
    });
  }

  /**
   * Faz bind (autenticação) com credenciais do usuário
   */
  private bindUser(
    client: Client,
    dn: string,
    password: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (err) => {
        if (err) {
          // Erro 49 = credenciais inválidas
          if (err.message.includes("49")) {
            return reject(new Error("INVALID_CREDENTIALS"));
          }
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Busca dados completos do usuário autenticado
   */
  private getUserData(client: Client, dn: string): Promise<LDAPUser> {
    return new Promise((resolve, reject) => {
      const searchOptions: SearchOptions = {
        scope: "base",
        attributes: [
          "uid",
          "cn",
          "mail",
          "displayName",
          "memberOf",
          "sAMAccountName",
        ],
      };

      client.search(dn, searchOptions, (err, res) => {
        if (err) return reject(err);

        let userData: Partial<LDAPUser> = { dn };

        res.on("searchEntry", (entry) => {
          const attrs = entry.attributes;

          attrs.forEach((attr) => {
            switch (attr.type) {
              case "uid":
              case "sAMAccountName":
                userData.username = attr.values[0] as string;
                break;
              case "mail":
                userData.email = attr.values[0] as string;
                break;
              case "displayName":
              case "cn":
                userData.displayName = attr.values[0] as string;
                break;
              case "memberOf":
                userData.groups = attr.values as string[];
                break;
            }
          });
        });

        res.on("error", (err) => reject(err));

        res.on("end", () => {
          resolve(userData as LDAPUser);
        });
      });
    });
  }

  /**
   * Fecha conexão LDAP com segurança
   */
  private closeClient(client: Client): void {
    try {
      client.unbind();
    } catch (error) {
      console.error("Erro ao fechar conexão LDAP:", error);
    }
  }

  /**
   * Trata erros de forma amigável
   */
  private handleError(error: any): Error {
    if (error.message === "INVALID_CREDENTIALS") {
      return new Error("Usuário ou senha inválidos");
    }

    if (error.code === "ETIMEDOUT") {
      return new Error("Tempo esgotado ao conectar no servidor LDAP");
    }

    if (error.code === "ECONNREFUSED") {
      return new Error("Não foi possível conectar ao servidor LDAP");
    }

    return new Error(`Erro na autenticação LDAP: ${error.message}`);
  }
}

// Exporta instância singleton
export const ldapAuth = new LDAPAuthService();
