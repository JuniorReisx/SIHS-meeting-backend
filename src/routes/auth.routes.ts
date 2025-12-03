import { Router } from 'express';
import { AuthController } from '../controllers/auth.controllers';
import { LDAPDebug } from '../utils/ldap.debug';

export const authRouter = Router();
const authController = new AuthController();

// Rotas originais
authRouter.post('/login', (req, res) => authController.login(req, res));
authRouter.get('/ldap/test', (req, res) => authController.testConnection(req, res));

// Nova rota de diagnóstico completo
authRouter.get('/ldap/debug', async (req, res) => {
  try {
    console.log('\n🔧 Iniciando diagnóstico LDAP...\n');
    await LDAPDebug.runFullDiagnostic();
    
    res.json({
      success: true,
      message: 'Diagnóstico completo! Verifique o console do servidor.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao executar diagnóstico',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Rota para testar busca de usuário específico
authRouter.get('/ldap/debug/user/:username', async (req, res) => {
  try {
    await LDAPDebug.testUserSearch(req.params.username);
    
    res.json({
      success: true,
      message: 'Busca completa! Verifique o console do servidor.',
      username: req.params.username
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

