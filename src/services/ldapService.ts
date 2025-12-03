import ldap, { Client, SearchOptions } from 'ldapjs';
import { ldapConfig } from '../config/ldap.config.js';

export class LDAPService {
  private client: Client | null = null;

  private createClient(): Client {
    const client = ldap.createClient({
      url: ldapConfig.url,
      timeout: ldapConfig.timeout,
      connectTimeout: ldapConfig.timeout
    });

    client.on('error', (err) => {
      console.error('LDAP Client Error:', err);
    });

    return client;
  }

  private async bindAdmin(client: Client): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(ldapConfig.adminDN, ldapConfig.adminPassword, (err) => {
        if (err) {
          reject(new Error(`LDAP Bind Error: ${err.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  async authenticate(username: string, password: string): Promise<boolean> {
    const client = this.createClient();

    try {
      await this.bindAdmin(client);
      const userDN = await this.findUserDN(client, username);
      
      if (!userDN) {
        return false;
      }

      client.unbind();

      const userClient = this.createClient();
      
      return new Promise((resolve) => {
        userClient.bind(userDN, password, (err) => {
          userClient.unbind();
          
          if (err) {
            console.error('Auth failed:', err.message);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      if (client) {
        client.unbind();
      }
    }
  }

  private async findUserDN(client: Client, username: string): Promise<string | null> {
    const opts: SearchOptions = {
      filter: `(|(cn=${username})(sAMAccountName=${username})(uid=${username}))`,
      scope: 'sub',
      attributes: ['dn']
    };

    return new Promise((resolve, reject) => {
      client.search(ldapConfig.baseDN, opts, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        let userDN: string | null = null;

        res.on('searchEntry', (entry) => {
          userDN = entry.objectName || null;
        });

        res.on('error', (err) => {
          reject(err);
        });

        res.on('end', () => {
          resolve(userDN);
        });
      });
    });
  }

  async getUserInfo(username: string): Promise<any> {
    const client = this.createClient();

    try {
      await this.bindAdmin(client);

      const opts: SearchOptions = {
        filter: `(|(cn=${username})(sAMAccountName=${username})(uid=${username}))`,
        scope: 'sub',
        attributes: ['cn', 'mail', 'displayName', 'sAMAccountAccount', 'memberOf']
      };

      return new Promise((resolve, reject) => {
        client.search(ldapConfig.baseDN, opts, (err, res) => {
          if (err) {
            reject(err);
            return;
          }

          let userData: any = null;

          res.on('searchEntry', (entry) => {
            userData = {
              dn: entry.objectName,
              cn: entry.attributes.find(attr => attr.type === 'cn')?.values[0],
              email: entry.attributes.find(attr => attr.type === 'mail')?.values[0],
              displayName: entry.attributes.find(attr => attr.type === 'displayName')?.values[0],
              username: entry.attributes.find(attr => attr.type === 'sAMAccountName')?.values[0],
              groups: entry.attributes.find(attr => attr.type === 'memberOf')?.values || []
            };
          });

          res.on('error', (err) => {
            reject(err);
          });

          res.on('end', () => {
            resolve(userData);
          });
        });
      });
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    } finally {
      client.unbind();
    }
  }

  async testConnection(): Promise<boolean> {
    const client = this.createClient();

    try {
      await this.bindAdmin(client);
      return true;
    } catch (error) {
      console.error('LDAP connection test failed:', error);
      return false;
    } finally {
      client.unbind();
    }
  }
}


