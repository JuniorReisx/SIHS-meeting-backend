import ldap from "ldapjs";
import type { Client, SearchOptions } from "ldapjs";

interface LDAPConfig {
  url: string;
  baseDN: string;
  timeout?: number;
}

interface LDAPUser {
  dn: string;
  username: string;
  email?: string;
  displayName?: string;
  groups?: string[];
}

export class LDAPAuthService {
  private config: LDAPConfig;

  constructor() {
    this.config = {
      url: process.env.LDAP_URL || "ldap://localhost:389",
      baseDN: process.env.LDAP_BASE_DN || "dc=empresa,dc=com",
      timeout: parseInt(process.env.LDAP_TIMEOUT || "5000"),
    };
  }

  async authenticate(username: string, password: string): Promise<LDAPUser> {
    if (!username || !password) {
      throw new Error("Usuário e senha são obrigatórios");
    }

    const client = this.createClient();

    try {
      const userDN = await this.findUserDN(client, username);

      if (!userDN) {
        throw new Error("Usuário não encontrado no diretório");
      }

      await this.bindUser(client, userDN, password);

      const userData = await this.getUserData(client, userDN);

      return userData;
    } catch (error) {
      throw this.handleError(error);
    } finally {
      this.closeClient(client);
    }
  }

  private createClient(): Client {
    return ldap.createClient({
      url: this.config.url,
      timeout: this.config.timeout,
      connectTimeout: this.config.timeout,
    });
  }

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

  private closeClient(client: Client): void {
    try {
      client.unbind();
    } catch (error) {
      console.error("Erro ao fechar conexão LDAP:", error);
    }
  }

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

export const ldapAuth = new LDAPAuthService();
