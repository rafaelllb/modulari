/**
 * Serviço de Autenticação
 * Responsável por gerenciar tokens JWT e requisições autenticadas
 */
class AuthService {
  constructor() {
    this.apiUrl = '/api';
    this.tokenKey = 'authToken';
  }

  /**
   * Obtém o token JWT do localStorage
   * @returns {string|null} Token JWT ou null se não existir
   */
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Configura headers de autenticação com o token JWT
   * @returns {Object} Headers HTTP com token de autenticação
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Faz uma requisição autenticada
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções da requisição fetch
   * @returns {Promise<Object>} Resposta da API
   */
  async fetchAuth(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    // Combinar headers padrão com os fornecidos
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Verificar código de resposta
      if (response.status === 401) {
        // Token expirado ou inválido
        this.handleUnauthorized();
        throw new Error('Não autorizado');
      }
      
      if (!response.ok) {
        // Tentar obter mensagem de erro da API
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}`);
      }
      
      // Verificar se a resposta está vazia
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`Erro ao acessar ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Trata erros de autorização
   */
  handleUnauthorized() {
    // Limpar token e redirecionar para login
    localStorage.removeItem(this.tokenKey);
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${currentPath}`;
  }

  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {boolean} remember - Lembrar usuário
   * @returns {Promise<Object>} Dados do usuário logado
   */
  async login(email, password, remember = false) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        remember
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha na autenticação');
    }
    
    const data = await response.json();
    
    // Armazenar token
    localStorage.setItem(this.tokenKey, data.token);
    
    return data;
  }

  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Resposta do registro
   */
  async register(userData) {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha no registro');
    }
    
    return await response.json();
  }

  /**
   * Solicita redefinição de senha
   * @param {string} email - Email do usuário
   * @returns {Promise<Object>} Resposta da solicitação
   */
  async requestPasswordReset(email) {
    const response = await fetch(`${this.apiUrl}/auth/reset-password/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha na solicitação');
    }
    
    return await response.json();
  }

  /**
   * Verifica código de redefinição de senha
   * @param {string} email - Email do usuário
   * @param {string} code - Código de verificação
   * @returns {Promise<Object>} Resposta da verificação
   */
  async verifyResetCode(email, code) {
    const response = await fetch(`${this.apiUrl}/auth/reset-password/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Código inválido');
    }
    
    return await response.json();
  }

  /**
   * Completa a redefinição de senha
   * @param {string} email - Email do usuário
   * @param {string} password - Nova senha
   * @param {string} token - Token de redefinição
   * @returns {Promise<Object>} Resposta da redefinição
   */
  async resetPassword(email, password, token) {
    const response = await fetch(`${this.apiUrl}/auth/reset-password/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, token })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha na redefinição de senha');
    }
    
    return await response.json();
  }

  /**
   * Faz logout do usuário
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
    window.location.href = '/login.html';
  }
}

// Criar instância singleton
const authService = new AuthService();

// Exportar para uso global
export default authService;