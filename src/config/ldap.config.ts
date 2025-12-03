import { LDAPConfig } from "../types/auth.types";

export const ldapConfig: LDAPConfig = {
  url: process.env.LDAP_URL || "ldap://10.161.246.244:389",
  baseDN: process.env.LDAP_BASE_DN || "dc=sihs,dc=local",
  adminDN: process.env.LDAP_ADMIN_DN || "cn=gil.junior,dc=sihs,dc=local",
  adminPassword: process.env.LDAP_ADMIN_PASSWORD || "",
  timeout: parseInt(process.env.LDAP_TIMEOUT || "5000", 10),
};
