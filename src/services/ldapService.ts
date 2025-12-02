import ldap from "ldapjs";
import type { Client, SearchOptions } from "ldapjs";
import type { LDAPConfig, LDAPUser } from "../types/auth.types";

export class LDAPService {
  private config: LDAPConfig;

  constructor() {
    this.config = {
      url: process.env.LDAP_URL || "ldap://localhost:389",
      baseDN: process.env.LDAP_BASE_DN || "dc=empresa,dc=com",
      timeout: parseInt(process.env.LDAP_TIMEOUT || "5000"),
      // Credenciais admin para buscar usuários
      adminDN: process.env.LDAP_ADMIN_DN || this.buildAdminDN(),
      adminPassword:
        process.env.LDAP_PASSWORD || process.env.LDAP_ADMIN_PASSWORD,
    };
  }

  /**
   * Constrói DN do admin a partir do login simples
   */
  private buildAdminDN(): string | undefined {
    const login = process.env.LDAP_LOGIN;
    const baseDN = process.env.LDAP_BASE_DN;

    if (!login || !baseDN) return undefined;

    // Tenta diferentes formatos comuns
    // AD geralmente usa: cn=usuario,cn=Users,dc=...
    // OpenLDAP geralmente usa: uid=usuario,ou=People,dc=...
    return `cn=${login},cn=Users,${baseDN}`;
  }

  /**
   * Autentica usuário no LDAP e retorna seus dados
   */
  async authenticate(username: string, password: string): Promise<LDAPUser> {
    if (!username || !password) {
      throw new Error("Usuário e senha são obrigatórios");
    }

    const client = this.createClient();

    try {
      // 1. Faz bind com admin para buscar usuário
      if (this.config.adminDN && this.config.adminPassword) {
        await this.bindAdmin(client);
      }

      // 2. Busca o DN completo do usuário
      const userDN = await this.findUserDN(client, username);

      if (!userDN) {
        throw new Error("Usuário não encontrado no diretório");
      }

      // 3. Desconecta admin e reconecta para testar credenciais do usuário
      this.closeClient(client);
      const userClient = this.createClient();

      try {
        // 4. Tenta fazer bind com as credenciais do usuário
        await this.bindUser(userClient, userDN, password);

        // 5. Busca informações completas do usuário
        const userData = await this.getUserData(userClient, userDN);

        return userData;
      } finally {
        this.closeClient(userClient);
      }
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.closeClient(client);
    }
  }

  /**
   * Verifica se usuário existe no LDAP (sem autenticar)
   */
  async userExists(username: string): Promise<boolean> {
    const client = this.createClient();

    try {
      // Bind com admin se disponível
      if (this.config.adminDN && this.config.adminPassword) {
        await this.bindAdmin(client);
      }

      const userDN = await this.findUserDN(client, username);
      return !!userDN;
    } catch (error) {
      return false;
    } finally {
      this.closeClient(client);
    }
  }

  /**
   * Busca usuários no LDAP por query
   */
  async searchUsers(query: string): Promise<LDAPUser[]> {
    const client = this.createClient();

    try {
      // Bind com admin se disponível
      if (this.config.adminDN && this.config.adminPassword) {
        await this.bindAdmin(client);
      }

      return await this.performSearch(client, query);
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.closeClient(client);
    }
  }

  /**
   * Verifica se o serviço LDAP está funcionando
   */
  async healthCheck(): Promise<boolean> {
    const client = this.createClient();

    try {
      // Tenta bind com admin se disponível
      if (this.config.adminDN && this.config.adminPassword) {
        await this.bindAdmin(client);
      }

      // Tenta fazer uma busca simples
      await new Promise<void>((resolve, reject) => {
        const searchOptions: SearchOptions = {
          filter: "(objectClass=*)",
          scope: "base",
          attributes: ["dn"],
          sizeLimit: 1,
        };

        const timeout = setTimeout(() => {
          reject(new Error("Timeout no health check"));
        }, this.config.timeout);

        client.search(this.config.baseDN, searchOptions, (err, res) => {
          if (err) {
            clearTimeout(timeout);
            return reject(err);
          }

          res.on("searchEntry", () => {
            clearTimeout(timeout);
            resolve();
          });

          res.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });

          res.on("end", () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      });

      return true;
    } catch (error) {
      console.error("Health check LDAP falhou:", error);
      return false;
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
   * Faz bind com credenciais de administrador
   */
  private bindAdmin(client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.adminDN || !this.config.adminPassword) {
        return resolve(); // Continua sem bind admin
      }

      client.bind(this.config.adminDN, this.config.adminPassword, (err) => {
        if (err) {
          console.error("Erro ao fazer bind com admin:", err);
          return reject(
            new Error("Falha ao conectar com credenciais administrativas")
          );
        }
        resolve();
      });
    });
  }

  /**
   * Busca o DN completo do usuário
   */
  private findUserDN(client: Client, username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Suporta múltiplos formatos: uid (LDAP), sAMAccountName (AD), cn
      const searchOptions: SearchOptions = {
        filter: `(|(uid=${username})(sAMAccountName=${username})(cn=${username})(userPrincipalName=${username}))`,
        scope: "sub",
        attributes: ["dn"],
      };

      client.search(this.config.baseDN, searchOptions, (err, res) => {
        if (err) return reject(err);

        let foundDN: string | null = null;

        res.on("searchEntry", (entry) => {
          foundDN = entry.objectName || null;
        });

        res.on("error", (err) => reject(err));

        res.on("end", () => resolve(foundDN || ""));
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
          // Erro 49 = credenciais inválidas (LDAP)
          // Erro 52e = credenciais inválidas (AD)
          if (err.message.includes("49") || err.message.includes("52e")) {
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
          "userPrincipalName",
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
              case "userPrincipalName":
                if (!userData.username) {
                  userData.username = attr.values[0] as string;
                }
                break;
              case "mail":
                userData.email = attr.values[0] as string;
                break;
              case "displayName":
              case "cn":
                if (!userData.displayName) {
                  userData.displayName = attr.values[0] as string;
                }
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
   * Realiza busca de usuários
   */
  private performSearch(client: Client, query: string): Promise<LDAPUser[]> {
    return new Promise((resolve, reject) => {
      // Busca por uid, cn, mail, displayName ou sAMAccountName
      const searchOptions: SearchOptions = {
        filter: `(|(uid=*${query}*)(cn=*${query}*)(mail=*${query}*)(displayName=*${query}*)(sAMAccountName=*${query}*)(userPrincipalName=*${query}*))`,
        scope: "sub",
        attributes: [
          "uid",
          "cn",
          "mail",
          "displayName",
          "memberOf",
          "sAMAccountName",
          "userPrincipalName",
        ],
        sizeLimit: 50, // Limita resultados
      };

      client.search(this.config.baseDN, searchOptions, (err, res) => {
        if (err) return reject(err);

        const users: LDAPUser[] = [];

        res.on("searchEntry", (entry) => {
          const attrs = entry.attributes;
          const user: Partial<LDAPUser> = {
            dn: entry.objectName || undefined,
          };

          attrs.forEach((attr) => {
            switch (attr.type) {
              case "uid":
              case "sAMAccountName":
              case "userPrincipalName":
                if (!user.username) {
                  user.username = attr.values[0] as string;
                }
                break;
              case "mail":
                user.email = attr.values[0] as string;
                break;
              case "displayName":
              case "cn":
                if (!user.displayName) {
                  user.displayName = attr.values[0] as string;
                }
                break;
              case "memberOf":
                user.groups = attr.values as string[];
                break;
            }
          });

          if (user.username) {
            users.push(user as LDAPUser);
          }
        });

        res.on("error", (err) => reject(err));

        res.on("end", () => resolve(users));
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
      // Ignora erros ao fechar
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

    if (error.message.includes("administrativas")) {
      return new Error(
        "Erro de configuração: credenciais administrativas inválidas"
      );
    }

    return new Error(`Erro na autenticação LDAP: ${error.message}`);
  }
}

// Exporta instância singleton
export const ldapService = new LDAPService();
