import * as ldap from "ldapjs";
import type { Client, Error as LDAPError } from "ldapjs";

const LDAP_CONFIG = {
  url: "ldap://10.160.240.244:389",
  baseDN: "DC=sihs,DC=local",
  userOU: "OU=CSM,OU=Usuarios,OU=SIHS",
  timeout: 5000,
  connectTimeout: 5000,
};
export interface AuthResult {
  success: boolean;
  message?: string;
  username?: string;
}

/**
 * Autenticação LDAP simplificada
 * @param username - Nome do usuário (ex: "emanoel" ou "011")
 * @param password - Senha do usuário
 * @returns Promise<boolean> - true se autenticado, false caso contrário
 */
export async function loginLDAP(
  username: string,
  password: string
): Promise<boolean> {
  if (!username || !password) {
    console.error("❌ Usuário e senha são obrigatórios");
    return false;
  }

  const sanitizedUsername = username.trim().replace(/[,=]/g, "");

  const client: Client = ldap.createClient({
    url: LDAP_CONFIG.url,
    timeout: LDAP_CONFIG.timeout,
    connectTimeout: LDAP_CONFIG.connectTimeout,
  });

  const userDN = `CN=${sanitizedUsername},${LDAP_CONFIG.userOU},${LDAP_CONFIG.baseDN}`;

  console.log("🔐 Tentando autenticar com DN:", userDN);

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.error("⏱️ Timeout na conexão LDAP");
      client.unbind();
      resolve(false);
    }, LDAP_CONFIG.timeout);

    client.on("error", (err) => {
      console.error("❌ Erro de conexão LDAP:", err.message);
      clearTimeout(timeoutId);
      client.unbind();
      resolve(false);
    });

    client.bind(userDN, password, (error: LDAPError | null) => {
      clearTimeout(timeoutId);

      client.unbind((unbindError) => {
        if (unbindError) {
          console.warn("⚠️ Erro ao desconectar:", unbindError.message);
        }
      });

      if (error) {
        if (error.message.includes("Invalid Credentials")) {
          console.error("❌ Credenciais inválidas para:", sanitizedUsername);
        } else if (error.message.includes("timeout")) {
          console.error("⏱️ Timeout na autenticação");
        } else {
          console.error("❌ Falha na autenticação:", error.message);
        }
        resolve(false);
      } else {
        console.log(`✅ Usuário ${sanitizedUsername} autenticado com sucesso`);
        resolve(true);
      }
    });
  });
}

export async function loginLDAPDetailed(
  username: string,
  password: string
): Promise<AuthResult> {
  const success = await loginLDAP(username, password);

  return {
    success,
    username: username.trim(),
    message: success
      ? "Autenticação bem-sucedida"
      : "Falha na autenticação - verifique suas credenciais",
  };
}

export async function testLDAPConnection(): Promise<boolean> {
  const client = ldap.createClient({
    url: LDAP_CONFIG.url,
    timeout: LDAP_CONFIG.timeout,
    connectTimeout: LDAP_CONFIG.connectTimeout,
  });

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.error("⏱️ Timeout ao testar conexão LDAP");
      client.unbind();
      resolve(false);
    }, LDAP_CONFIG.timeout);

    client.on("connect", () => {
      clearTimeout(timeoutId);
      console.log("✅ Conexão LDAP estabelecida com sucesso");
      client.unbind();
      resolve(true);
    });

    client.on("error", (err) => {
      clearTimeout(timeoutId);
      console.error("❌ Erro ao conectar no LDAP:", err.message);
      client.unbind();
      resolve(false);
    });
  });
}
