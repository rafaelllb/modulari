/**
 * Serviço de Gestão de Permissões
 * Este serviço gerencia a autenticação e autorização de usuários
 */
class PermissionService {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
    this.tokenExpiration = 'tokenExpiration';
    
    // Define níveis de acesso por papel
    this.rolePermissions = {
      // Usuário comum
      'user': [
        'profile:read',
        'profile:update',
        'property:read',
        'property:favorite',
        'matches:read',
        'matches:update'
      ],
      // Corretor de imóveis
      'agent': [
        'profile:read',
        'profile:update',
        'property:read',
        'property:favorite',
        'property:create',
        'property:update',
        'matches:read',
        'matches:update',
        'clients:read'
      ],
      // Administrador
      'admin': [
        'profile:read',
        'profile:update',
        'property:read',
        'property:favorite',
        'property:create',
        'property:update',
        'property:delete',
        'matches:read',
        'matches:update',
        'clients:read',
        'clients:update',
        'users:read',
        'users:update',
        'users:delete',
        'analytics:read'
      ]
    };
  }

  /**
   * Decodifica o token JWT
   * @param {string} token - Token JWT
   * @returns {Object} Payload do token decodificado
   */
  decodeToken(token) {
    try {
      // No client-side, podemos fazer um decode simples do JWT
      // (não verificamos a assinatura, isso é responsabilidade do servidor)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} Verdadeiro se autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.tokenKey);
    const expiration = localStorage.getItem(this.tokenExpiration);
    
    if (!token || !expiration) {
      return false;
    }
    
    // Verificar se o token expirou
    const now = new Date().getTime();
    if (now > parseInt(expiration)) {
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * Obtém o payload do token do usuário atual
   * @returns {Object|null} Payload do token ou null se não autenticado
   */
  getCurrentUser() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    const token = localStorage.getItem(this.tokenKey);
    return this.decodeToken(token);
  }

  /**
   * Obtém o perfil completo do usuário do localStorage
   * @returns {Object|null} Dados do usuário
   */
  getUserData() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica se o usuário tem uma determinada permissão
   * @param {string} permission - Permissão a verificar
   * @returns {boolean} Verdadeiro se tem permissão
   */
  hasPermission(permission) {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }
    
    const userRole = user.role;
    const rolePermissions = this.rolePermissions[userRole] || [];
    
    return rolePermissions.includes(permission);
  }

  /**
   * Verifica se o usuário tem um determinado papel
   * @param {string|string[]} roles - Papel ou array de papéis a verificar
   * @returns {boolean} Verdadeiro se tem o papel
   */
  hasRole(roles) {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    const user = this.getCurrentUser();
    if (!user || !user.role) {
      return false;
    }
    
    const userRole = user.role;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return userRole === roles;
  }

  /**
   * Autentica o usuário e armazena o token
   * @param {string} token - Token JWT
   * @param {Object} userData - Dados do usuário
   * @param {number} expiresIn - Tempo de expiração em segundos
   */
  login(token, userData, expiresIn = 3600) {
    // Armazenar token
    localStorage.setItem(this.tokenKey, token);
    
    // Armazenar dados do usuário
    localStorage.setItem(this.userKey, JSON.stringify(userData));
    
    // Calcular expiração
    const expirationTime = new Date().getTime() + expiresIn * 1000;
    localStorage.setItem(this.tokenExpiration, expirationTime.toString());
    
    // Configurar timer para logout automático
    this.setLogoutTimer(expiresIn * 1000);
  }

  /**
   * Configura um timer para logout automático
   * @param {number} expirationTime - Tempo em milissegundos
   */
  setLogoutTimer(expirationTime) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expirationTime);
  }

  /**
   * Faz logout do usuário
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenExpiration);
    
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    
    // Redirecionar para login
    window.location.href = 'login.html';
  }

  /**
   * Tenta renovar automaticamente o token
   * @returns {Promise<boolean>} Verdadeiro se renovado com sucesso
   */
  async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(this.tokenKey)}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao renovar token');
      }
      
      const data = await response.json();
      this.login(data.token, data.user, data.expiresIn);
      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      this.logout();
      return false;
    }
  }
  
  /**
   * Verifica se precisa renovar o token
   * @returns {boolean} Verdadeiro se precisa renovar
   */
  needsTokenRefresh() {
    if (!this.isAuthenticated()) {
      return false;
    }
    
    const expiration = parseInt(localStorage.getItem(this.tokenExpiration));
    const now = new Date().getTime();
    
    // Renovar quando faltar menos de 5 minutos (300000 ms)
    return expiration - now < 300000;
  }
}

// Instanciar o serviço
const permissionService = new PermissionService();

// Exportar instância singleton
export default permissionService;