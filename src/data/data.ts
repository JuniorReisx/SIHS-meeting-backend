import * as ldap from "ldapjs";
import type { Client, Error as LDAPError } from "ldapjs";

// ============================================
// CONFIGURAÇÃO LDAP - SIHS
// ============================================
// Baseada no resultado do whoami /fqdn:
// CN=...,OU=CSM,OU=Usuarios,OU=SIHS,DC=sihs,DC=local

const LDAP_CONFIG = {
  url: "ldap://10.160.240.244:389", // IP do servidor AD
  baseDN: "DC=sihs,DC=local", // Domínio base
  userOU: "OU=CSM,OU=Usuarios,OU=SIHS", // Estrutura de OUs completa
  timeout: 5000,
  connectTimeout: 5000,
};

/**
 * Interface para resultado da autenticação com mais detalhes
 */
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
  // Validação básica
  if (!username || !password) {
    console.error("❌ Usuário e senha são obrigatórios");
    return false;
  }

  // Sanitização do username (remove espaços e caracteres especiais)
  const sanitizedUsername = username.trim().replace(/[,=]/g, "");

  // Criar cliente LDAP
  const client: Client = ldap.createClient({
    url: LDAP_CONFIG.url,
    timeout: LDAP_CONFIG.timeout,
    connectTimeout: LDAP_CONFIG.connectTimeout,
  });

  // Montar o DN completo do usuário
  const userDN = `CN=${sanitizedUsername},${LDAP_CONFIG.userOU},${LDAP_CONFIG.baseDN}`;

  console.log("🔐 Tentando autenticar com DN:", userDN);

  return new Promise((resolve) => {
    // Timeout de segurança
    const timeoutId = setTimeout(() => {
      console.error("⏱️ Timeout na conexão LDAP");
      client.unbind();
      resolve(false);
    }, LDAP_CONFIG.timeout);

    // Tratamento de erros de conexão
    client.on("error", (err) => {
      console.error("❌ Erro de conexão LDAP:", err.message);
      clearTimeout(timeoutId);
      client.unbind();
      resolve(false);
    });

    // Tentar autenticar
    client.bind(userDN, password, (error: LDAPError | null) => {
      clearTimeout(timeoutId);

      // Sempre fechar a conexão
      client.unbind((unbindError) => {
        if (unbindError) {
          console.warn("⚠️ Erro ao desconectar:", unbindError.message);
        }
      });

      if (error) {
        // Tratamento de erros específicos
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

/**
 * Versão alternativa que retorna mais informações
 */
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

/**
 * Testa a conexão com o servidor LDAP
 */
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