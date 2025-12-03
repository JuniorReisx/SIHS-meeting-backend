import ldap from 'ldapjs';
import { ldapConfig } from '../config/ldap.config';
import * as net from 'net';

export class LDAPDebug {
  
  static async runFullDiagnostic() {
    console.log('='.repeat(50));
    console.log('🔍 DIAGNÓSTICO LDAP');
    console.log('='.repeat(50));
    
    console.log('\n📋 1. Verificando Configurações:');
    console.log('   URL:', ldapConfig.url);
    console.log('   Base DN:', ldapConfig.baseDN);
    console.log('   Admin DN:', ldapConfig.adminDN);
    console.log('   Password:', ldapConfig.adminPassword ? '****' + ldapConfig.adminPassword.slice(-4) : 'NÃO DEFINIDA');
    console.log('   Timeout:', ldapConfig.timeout + 'ms');
    
    console.log('\n🌐 2. Testando Conectividade de Rede:');
    await this.testNetworkConnectivity();
    
    console.log('\n🔌 3. Testando Conexão LDAP:');
    await this.testBasicConnection();
    
    console.log('\n🔐 4. Testando Bind Admin:');
    await this.testAdminBind();
    
    console.log('\n🔎 5. Testando Busca Simples:');
    await this.testSimpleSearch();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Diagnóstico Completo!');
    console.log('='.repeat(50));
  }

  static async testNetworkConnectivity(): Promise<void> {
    return new Promise((resolve) => {
      const url = new URL(ldapConfig.url);
      const socket = new net.Socket();
      
      socket.setTimeout(3000);
      
      socket.on('connect', () => {
        console.log('   ✅ Porta acessível:', url.hostname + ':' + url.port);
        socket.destroy();
        resolve();
      });
      
      socket.on('timeout', () => {
        console.log('   ❌ Timeout ao conectar');
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (err: any) => {
        console.log('   ❌ Erro de rede:', err.message);
        console.log('   💡 Possíveis causas:');
        console.log('      - Firewall bloqueando porta 389');
        console.log('      - Servidor LDAP não está rodando');
        console.log('      - IP incorreto no .env');
        resolve();
      });
      
      socket.connect(parseInt(url.port || '389'), url.hostname);
    });
  }

  static async testBasicConnection(): Promise<void> {
    return new Promise((resolve) => {
      const client = ldap.createClient({
        url: ldapConfig.url,
        timeout: ldapConfig.timeout,
        connectTimeout: ldapConfig.timeout
      });

      let connected = false;

      client.on('connect', () => {
        console.log('   ✅ Cliente LDAP conectado');
        connected = true;
        client.unbind();
        resolve();
      });

      client.on('connectError', (err) => {
        console.log('   ❌ Erro ao conectar:', err.message);
        resolve();
      });

      client.on('error', (err) => {
        if (!connected) {
          console.log('   ❌ Erro no cliente:', err.message);
          resolve();
        }
      });

      setTimeout(() => {
        if (!connected) {
          console.log('   ❌ Timeout na conexão');
          client.unbind();
          resolve();
        }
      }, ldapConfig.timeout);
    });
  }

  static async testAdminBind(): Promise<void> {
    return new Promise((resolve) => {
      const client = ldap.createClient({
        url: ldapConfig.url,
        timeout: ldapConfig.timeout,
        connectTimeout: ldapConfig.timeout
      });

      client.bind(ldapConfig.adminDN, ldapConfig.adminPassword, (err) => {
        if (err) {
          console.log('   ❌ Falha no bind:', err.message);
          console.log('   💡 Verifique:');
          console.log('      - LDAP_ADMIN_DN:', ldapConfig.adminDN);
          console.log('      - LDAP_ADMIN_PASSWORD está correto?');
          console.log('      - Usuário tem permissão de bind?');
          console.log('      - Formato correto: cn=usuario,dc=sihs,dc=local');
        } else {
          console.log('   ✅ Bind realizado com sucesso!');
        }
        
        client.unbind();
        resolve();
      });

      client.on('error', (err) => {
        console.log('   ❌ Erro:', err.message);
        resolve();
      });
    });
  }

  static async testSimpleSearch(): Promise<void> {
    return new Promise((resolve) => {
      const client = ldap.createClient({
        url: ldapConfig.url,
        timeout: ldapConfig.timeout,
        connectTimeout: ldapConfig.timeout
      });

      client.bind(ldapConfig.adminDN, ldapConfig.adminPassword, (err) => {
        if (err) {
          console.log('   ❌ Não foi possível fazer bind para busca');
          client.unbind();
          resolve();
          return;
        }

        const opts = {
          filter: '(objectClass=*)',
          scope: 'base' as const,
          attributes: ['namingContexts']
        };

        client.search('', opts, (err, res) => {
          if (err) {
            console.log('   ❌ Erro na busca:', err.message);
            client.unbind();
            resolve();
            return;
          }

          let found = false;

          res.on('searchEntry', (entry) => {
            found = true;
            console.log('   ✅ Busca funcionando!');
            console.log('   📁 Base DN configurado:', ldapConfig.baseDN);
          });

          res.on('error', (err) => {
            console.log('   ❌ Erro durante busca:', err.message);
          });

          res.on('end', () => {
            if (!found) {
              console.log('   ⚠️  Nenhum resultado encontrado');
            }
            client.unbind();
            resolve();
          });
        });
      });
    });
  }

  static async testUserSearch(username: string): Promise<void> {
    console.log('\n🔎 Buscando usuário:', username);
    
    return new Promise((resolve) => {
      const client = ldap.createClient({
        url: ldapConfig.url,
        timeout: ldapConfig.timeout
      });

      client.bind(ldapConfig.adminDN, ldapConfig.adminPassword, (err) => {
        if (err) {
          console.log('   ❌ Falha no bind');
          client.unbind();
          resolve();
          return;
        }

        const opts = {
          filter: `(|(cn=${username})(sAMAccountName=${username})(uid=${username}))`,
          scope: 'sub' as const,
          attributes: ['cn', 'mail', 'displayName', 'sAMAccountName']
        };

        client.search(ldapConfig.baseDN, opts, (err, res) => {
          if (err) {
            console.log('   ❌ Erro na busca:', err.message);
            client.unbind();
            resolve();
            return;
          }

          let found = false;

          res.on('searchEntry', (entry) => {
            found = true;
            console.log('   ✅ Usuário encontrado!');
            console.log('   DN:', entry.objectName);
            entry.attributes.forEach(attr => {
              console.log(`   ${attr.type}:`, attr.values[0]);
            });
          });

          res.on('error', (err) => {
            console.log('   ❌ Erro:', err.message);
          });

          res.on('end', () => {
            if (!found) {
              console.log('   ⚠️  Usuário não encontrado');
              console.log('   💡 Tente buscar com outro username');
            }
            client.unbind();
            resolve();
          });
        });
      });
    });
  }
}