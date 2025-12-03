import ldap from 'ldapjs';

export class LDAPService {
  private ldapUrl: string;
  private baseDN: string;
  private adminDN: string;
  private adminPassword: string;
  private timeout: number;

  constructor() {
    this.ldapUrl = process.env.LDAP_URL || '';
    this.baseDN = process.env.LDAP_BASE_DN || '';
    this.adminDN = process.env.LDAP_ADMIN_DN || '';
    this.adminPassword = process.env.LDAP_ADMIN_PASSWORD || '';
    this.timeout = parseInt(process.env.LDAP_TIMEOUT || '5000');

    // Validação das configurações
    if (!this.ldapUrl || !this.baseDN || !this.adminDN || !this.adminPassword) {
      console.error('⚠️ Configurações LDAP incompletas no .env');
    }
  }

  /**
   * Cria um cliente LDAP
   */
  private createClient(): any {
    return ldap.createClient({
      url: this.ldapUrl,
      timeout: this.timeout,
      connectTimeout: 5000,
    });
  }

  /**
   * Busca o DN (Distinguished Name) do usuário
   */
  private async findUserDN(username: string): Promise<{ dn: string; userData: any } | null> {
    const client = this.createClient();

    try {
      // Conecta como admin
      await new Promise<void>((resolve, reject) => {
        client.bind(this.adminDN, this.adminPassword, (err: any) => {
          if (err) {
            console.error('❌ Erro ao conectar admin:', err.message);
            reject(err);
          } else {
            console.log('✅ Admin conectado');
            resolve();
          }
        });
      });

      // Busca o usuário
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
          'distinguishedName',
          'memberOf',
          'department'
        ],
        sizeLimit: 1
      };

      console.log(`🔎 Buscando usuário: ${username}`);

      const result = await new Promise<{ dn: string; userData: any } | null>((resolve, reject) => {
        client.search(this.baseDN, opts, (err: any, searchRes: any) => {
          if (err) {
            console.error('❌ Erro na busca:', err.message);
            return reject(err);
          }

          let userData: any = null;

          searchRes.on('searchEntry', (entry: any) => {
            const data: any = {};
            entry.attributes.forEach((attr: any) => {
              if (attr.values && attr.values.length > 0) {
                data[attr.type] = attr.values.length === 1 ? attr.values[0] : attr.values;
              }
            });
            userData = data;
            console.log(`✅ Usuário encontrado: ${data.cn} (${data.distinguishedName})`);
          });

          searchRes.on('error', (err: any) => {
            console.error('❌ Erro no resultado:', err.message);
            reject(err);
          });

          searchRes.on('end', () => {
            if (!userData) {
              console.log('❌ Usuário não encontrado');
              resolve(null);
            } else {
              resolve({
                dn: userData.distinguishedName,
                userData: userData
              });
            }
          });
        });
      });

      client.unbind();
      return result;

    } catch (error) {
      try {
        client.unbind();
      } catch (e) {
        // Ignora erro de unbind
      }
      throw error;
    }
  }

  /**
   * Autentica o usuário no LDAP
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      console.log(`\n🔐 Tentativa de autenticação: ${username}`);

      // 1. Busca o DN do usuário
      const userInfo = await this.findUserDN(username);
      
      if (!userInfo) {
        console.log('❌ Usuário não encontrado no LDAP');
        return false;
      }

      const { dn } = userInfo;

      // 2. Tenta autenticar com as credenciais do usuário
      const client = this.createClient();

      const isAuthenticated = await new Promise<boolean>((resolve) => {
        client.bind(dn, password, (err: any) => {
          if (err) {
            console.error('❌ Senha inválida:', err.message);
            resolve(false);
          } else {
            console.log('✅ Autenticação bem-sucedida!');
            resolve(true);
          }
        });
      });

      client.unbind();
      return isAuthenticated;

    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém informações do usuário
   */
  async getUserInfo(username: string): Promise<any> {
    try {
      console.log(`📋 Buscando informações do usuário: ${username}`);

      const userInfo = await this.findUserDN(username);

      if (!userInfo) {
        return null;
      }

      const { userData } = userInfo;

      // Extrai departamento dos grupos
      const extractDepartment = (groups: any): string | null => {
        if (!groups) return null;
        const groupList = Array.isArray(groups) ? groups : [groups];
        const firstGroup = groupList[0];
        const parts = firstGroup.split(',');
        
        for (let part of parts) {
          if (part.startsWith('OU=')) {
            return part.replace('OU=', '');
          }
        }
        return null;
      };

      const department = extractDepartment(userData.memberOf);

      return {
        username: userData.sAMAccountName || userData.cn,
        fullName: userData.displayName || userData.cn,
        email: userData.mail || userData.userPrincipalName,
        department: department,
        distinguishedName: userData.distinguishedName,
        groups: userData.memberOf
      };

    } catch (error) {
      console.error('❌ Erro ao buscar informações do usuário:', error);
      return null;
    }
  }

  /**
   * Testa a conexão LDAP
   */
  async testConnection(): Promise<boolean> {
    const client = this.createClient();

    try {
      console.log('\n🔧 Testando conexão LDAP...');
      console.log(`📡 URL: ${this.ldapUrl}`);
      console.log(`👤 Admin DN: ${this.adminDN}`);
      console.log(`📂 Base DN: ${this.baseDN}\n`);

      const isConnected = await new Promise<boolean>((resolve) => {
        client.bind(this.adminDN, this.adminPassword, (err: any) => {
          if (err) {
            console.error('❌ Falha na conexão:', err.message);
            resolve(false);
          } else {
            console.log('✅ Conexão estabelecida com sucesso!');
            resolve(true);
          }
        });
      });

      client.unbind();
      return isConnected;

    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      try {
        client.unbind();
      } catch (e) {
        // Ignora erro de unbind
      }
      return false;
    }
  }
}
