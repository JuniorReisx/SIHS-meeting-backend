import { Router } from "express";
import ldap from "ldapjs";
import { AuthController } from "../controllers/auth/auth.controllers";
import { LDAPDebug } from "../utils/ldap.debug";

export const authRouter = Router();
const authController = new AuthController();

// Rotas originais
authRouter.post("/login", (req, res) => authController.login(req, res));
authRouter.get("/test", (req, res) =>
  authController.testConnection(req, res)
);

// Nova rota de diagnóstico completo
authRouter.get("/debug", async (req, res) => {
  try {
    console.log("\n🔧 Iniciando diagnóstico LDAP...\n");
    await LDAPDebug.runFullDiagnostic();

    res.json({
      success: true,
      message: "Diagnóstico completo! Verifique o console do servidor.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao executar diagnóstico",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Rota para testar busca de usuário específico
authRouter.get("/debug/user/:username", async (req, res) => {
  try {
    await LDAPDebug.testUserSearch(req.params.username);

    res.json({
      success: true,
      message: "Busca completa! Verifique o console do servidor.",
      username: req.params.username,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Rota para buscar informações completas do usuário
authRouter.get('/user/:username', async (req, res) => {
  const username = req.params.username;

  // Validação básica
  if (!username || username.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Username é obrigatório'
    });
  }

  // Validação das variáveis de ambiente
  const adminDN = process.env.LDAP_ADMIN_DN;
  const adminPassword = process.env.LDAP_ADMIN_PASSWORD;
  const baseDN = process.env.LDAP_BASE_DN;
  const ldapUrl = process.env.LDAP_URL;

  if (!adminDN || !adminPassword || !baseDN || !ldapUrl) {
    return res.status(500).json({
      success: false,
      error: 'Configurações LDAP incompletas no servidor'
    });
  }

  const client = ldap.createClient({
    url: ldapUrl,
    timeout: parseInt(process.env.LDAP_TIMEOUT || '5000'),
    connectTimeout: 5000,
  });

  // Tratamento de erros de conexão
  client.on('error', (err) => {
    console.error('Erro na conexão LDAP:', err);
  });

  try {
    console.log(`\n🔍 Buscando usuário: ${username}`);
    console.log(`📡 Conectando em: ${ldapUrl}`);
    console.log(`👤 Como: ${adminDN}`);
    console.log(`📂 Base DN: ${baseDN}\n`);

    // 1 — Conecta como admin (usando Promise para melhor controle)
    await new Promise<void>((resolve, reject) => {
      client.bind(adminDN, adminPassword, (err) => {
        if (err) {
          console.error('❌ Erro ao autenticar:', err.message);
          reject(new Error(`Erro ao autenticar no LDAP: ${err.message}`));
        } else {
          console.log('✅ Autenticação bem-sucedida!');
          resolve();
        }
      });
    });

    // 2 — Opções de busca otimizadas para Active Directory
    // Busca por vários atributos comuns do AD
    const searchFilter = `(|(sAMAccountName=${username})(userPrincipalName=${username}@*)(cn=${username})(mail=${username}))`;
    
    const opts: ldap.SearchOptions = {
      filter: searchFilter,
      scope: 'sub',
      attributes: [
        'cn',
        'displayName',
        'mail',
        'userPrincipalName',
        'sAMAccountName',
        'department',
        'ou',
        'memberOf',
        'distinguishedName'
      ],
      paged: false,
      sizeLimit: 10 // Limita a 10 resultados
    };

    console.log(`🔎 Filtro de busca: ${searchFilter}`);

    // 3 — Realiza a busca (usando Promise)
    const userData = await new Promise<any>((resolve, reject) => {
      client.search(baseDN, opts, (err, searchRes) => {
        if (err) {
          console.error('❌ Erro na busca:', err.message);
          return reject(new Error(`Erro na busca: ${err.message}`));
        }

        let foundUser: any = null;
        const entries: any[] = [];

        searchRes.on('searchEntry', (entry) => {
          // Converte SearchEntry para objeto JavaScript
          const userData: any = {};
          
          // Extrai todos os atributos
          entry.attributes.forEach(attr => {
            if (attr.values && attr.values.length > 0) {
              // Se tem múltiplos valores (como memberOf), mantém como array
              userData[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
            }
          });
          
          console.log(`✅ Usuário encontrado: ${userData.cn || userData.sAMAccountName || userData.dn || 'N/A'}`);
          
          foundUser = userData;
          entries.push(userData);
        });

        searchRes.on('error', (err) => {
          console.error('❌ Erro no resultado:', err.message);
          reject(new Error(`Erro no resultado da busca: ${err.message}`));
        });

        searchRes.on('end', (result) => {
          console.log(`\n📊 Busca finalizada. Status: ${result?.status || 0}`);
          console.log(`📈 Total de entradas encontradas: ${entries.length}\n`);

          if (result?.status !== 0 && result?.status !== undefined) {
            reject(new Error(`Busca finalizada com status: ${result.status}`));
          } else if (entries.length > 1) {
            resolve({
              multiple: true,
              count: entries.length,
              users: entries
            });
          } else {
            resolve(foundUser);
          }
        });
      });
    });

    // Desconecta
    client.unbind();
    console.log('🔌 Desconectado do LDAP\n');

    // 4 — Retorna resultado
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: `Usuário '${username}' não encontrado no Active Directory`,
        searchedIn: baseDN,
        filter: searchFilter
      });
    }

    if (userData.multiple) {
      return res.json({
        success: true,
        message: `Múltiplos usuários encontrados (${userData.count})`,
        count: userData.count,
        data: userData.users,
        note: 'Refine sua busca para obter um resultado único'
      });
    }

    // Funções auxiliares para extrair departamento
    function extractDepartmentFromGroups(groups: string[] | string | undefined) {
      if (!groups) return null;
      const list = Array.isArray(groups) ? groups : [groups];
      const firstGroup = list[0];
      const match = firstGroup.match(/CN=([^,]+)/);
      return match ? match[1] : null;
    }

    function extractOUAfterCN(groups: any) {
      if (!groups || groups.length === 0) return null;
      const group = groups[0];
      const parts = group.split(',');
      for (let part of parts) {
        if (part.startsWith("OU=")) {
          return part.replace("OU=", "");
        }
      }
      return null;
    }

    const departmentFromOU = extractOUAfterCN(userData.memberOf);

    // Formata os dados para melhor visualização
    const formattedData = {
      username: userData.sAMAccountName || userData.cn,
      fullName: userData.displayName || userData.cn,
      email: userData.mail || userData.userPrincipalName,
      department: departmentFromOU,
      distinguishedName: userData.distinguishedName,
      groups: userData.memberOf
    };

    res.json({
      success: true,
      message: 'Usuário encontrado com sucesso',
      data: formattedData
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    // Garante desconexão em caso de erro
    try {
      client.unbind();
    } catch (e) {
      // Ignora erro de unbind
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: 'Verifique os logs do servidor para mais informações'
    });
  }
});