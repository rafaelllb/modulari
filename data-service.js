/**
 * Serviço de Dados Centralizado
 * Responsável por gerenciar o armazenamento e recuperação de dados da aplicação
 */
class DataService {
  constructor() {
    // Chaves para localStorage
    this.KEYS = {
      ACTIVE_PROFILE: 'activeProfile',
      BUYER_PROFILES: 'buyerProfiles',
      PREFERENCES: 'preferences',
      SELECTED_LIFESTYLE: 'selectedLifestyle',
      MATCHES_PREFIX: 'matches_',
      CURRENT_PROPERTY: 'currentProperty',
    };

    // Dados mockados para desenvolvimento
    this.mockData = {
      properties: {
        beach: [
          {
            id: 1,
            title: 'Casa na Praia dos Sonhos',
            price: 'R$ 850.000',
            image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
            features: ['Vista para o mar', '3 quartos', '200m²', 'Piscina', 'Área tranquila', 'Alto potencial de valorização'],
            details: {
              location: 'Primeira quadra do mar',
              noiseLevel: 'low',
              nearActivities: true,
              investmentPotential: true,
              description: 'Linda casa com vista para o mar, localizada na primeira quadra da praia. Ideal para moradia ou investimento.',
              address: 'Rua das Conchas, 123 - Praia dos Sonhos'
            }
          },
          {
            id: 2,
            title: 'Apartamento Beira Mar',
            price: 'R$ 650.000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            features: ['Varanda gourmet', '2 quartos', '120m²', 'Academia', 'Próximo ao centro', 'Andar alto'],
            details: {
              location: 'Avenida beira mar',
              noiseLevel: 'medium',
              nearActivities: true,
              investmentPotential: true,
              description: 'Apartamento moderno com vista privilegiada para o mar. Condomínio com infraestrutura completa.',
              address: 'Av. Beira Mar, 500, Apto 1201 - Praia Grande'
            }
          }
        ],
        city: [
          {
            id: 3,
            title: 'Apartamento Jardins',
            price: 'R$ 750.000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            features: ['Alto padrão', '3 quartos', '150m²', 'Varanda', 'Próximo a comércios', 'Condomínio fechado'],
            details: {
              location: 'Jardins',
              noiseLevel: 'low',
              nearActivities: true,
              investmentPotential: true,
              description: 'Apartamento de alto padrão em localização privilegiada, próximo aos melhores restaurantes e serviços da cidade.',
              address: 'Rua dos Ipês, 750, Apto 502 - Jardins'
            }
          },
          {
            id: 4,
            title: 'Studio Centro',
            price: 'R$ 450.000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            features: ['Mobiliado', '1 quarto', '45m²', 'Academia', 'Próximo ao centro', 'Alto potencial de valorização'],
            details: {
              location: 'Centro',
              noiseLevel: 'high',
              nearActivities: true,
              investmentPotential: true,
              description: 'Studio moderno, totalmente mobiliado e equipado, em localização estratégica no centro da cidade.',
              address: 'Rua Central, 100, Apto 1507 - Centro'
            }
          }
        ],
        countryside: [
          {
            id: 5,
            title: 'Casa de Campo',
            price: 'R$ 920.000',
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
            features: ['Área verde', '4 quartos', '300m²', 'Piscina', 'Área tranquila', 'Condomínio fechado'],
            details: {
              location: 'Condomínio Campo Verde',
              noiseLevel: 'very_low',
              nearActivities: false,
              investmentPotential: false,
              description: 'Casa espaçosa em condomínio fechado com segurança 24h, perfeita para quem busca tranquilidade sem abrir mão do conforto.',
              address: 'Estrada do Campo, Km 5 - Condomínio Campo Verde'
            }
          },
          {
            id: 6,
            title: 'Chácara Especial',
            price: 'R$ 780.000',
            image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
            features: ['Pomar', '3 quartos', '250m²', 'Lago', 'Área verde', 'Área tranquila'],
            details: {
              location: 'Área rural',
              noiseLevel: 'very_low',
              nearActivities: false,
              investmentPotential: false,
              description: 'Chácara com amplo espaço verde, pomar, lago e casa confortável. Perfeita para descanso e lazer nos finais de semana.',
              address: 'Estrada Rural, Km 10 - Área rural'
            }
          }
        ]
      }
    };
  }

  /**
   * Obtém todos os imóveis disponíveis
   * @returns {Array} Array com todos os imóveis
   */
  getAllProperties() {
    return [
      ...this.mockData.properties.beach,
      ...this.mockData.properties.city,
      ...this.mockData.properties.countryside
    ];
  }

  /**
   * Obtém imóveis por tipo de lifestyle
   * @param {string} lifestyle - Tipo de lifestyle (beach, city, countryside)
   * @returns {Array} Array com imóveis filtrados
   */
  getPropertiesByLifestyle(lifestyle) {
    return this.mockData.properties[lifestyle] || [];
  }

  /**
   * Obtém um imóvel específico por ID
   * @param {number} id - ID do imóvel
   * @returns {Object|null} Imóvel encontrado ou null
   */
  getPropertyById(id) {
    id = parseInt(id);
    return this.getAllProperties().find(property => property.id === id) || null;
  }

  /**
   * Salva as preferências do usuário
   * @param {Object} preferences - Preferências do usuário
   */
  savePreferences(preferences) {
    this.setStorageItem(this.KEYS.PREFERENCES, JSON.stringify(preferences));
  }

  /**
   * Obtém as preferências do usuário
   * @returns {Object} Preferências do usuário
   */
  getPreferences() {
    return JSON.parse(this.getStorageItem(this.KEYS.PREFERENCES) || '{}');
  }

  /**
   * Salva o lifestyle selecionado
   * @param {string} lifestyle - Tipo de lifestyle (beach, city, countryside)
   */
  saveSelectedLifestyle(lifestyle) {
    this.setStorageItem(this.KEYS.SELECTED_LIFESTYLE, lifestyle);
  }

  /**
   * Obtém o lifestyle selecionado
   * @returns {string} Tipo de lifestyle selecionado
   */
  getSelectedLifestyle() {
    return this.getStorageItem(this.KEYS.SELECTED_LIFESTYLE) || '';
  }

  /**
   * Calcula o score de match entre as preferências do usuário e um imóvel
   * @param {Object} property - Imóvel a ser avaliado
   * @param {Object} preferences - Preferências do usuário
   * @returns {number} Score de match (0-100)
   */
  calculateMatchScore(property, preferences) {
    let score = 0;
    
    if (!preferences) return 50; // Score padrão se não houver preferências
    
    // Avalia propósito (morar, investir, ambos)
    if (preferences.purpose) {
      if (preferences.purpose === 'invest' && property.details.investmentPotential) {
        score += 25;
      }
      if (preferences.purpose === 'live' && property.features.includes('Área tranquila')) {
        score += 25;
      }
      if (preferences.purpose === 'both' && 
          property.details.investmentPotential && 
          property.features.includes('Área tranquila')) {
        score += 25;
      }
    }

    // Avalia estilo de vida (tranquilo, ativo, balanceado)
    if (preferences.lifestyle) {
      if (preferences.lifestyle === 'quiet' && 
          (property.details.noiseLevel === 'low' || property.details.noiseLevel === 'very_low')) {
        score += 20;
      }
      if (preferences.lifestyle === 'active' && property.details.nearActivities) {
        score += 20;
      }
      if (preferences.lifestyle === 'balanced') {
        // Estilo balanceado obtém pontuação média entre os extremos
        score += 10;
        if (property.features.includes('Próximo ao centro') && 
            property.features.includes('Área tranquila')) {
          score += 10;
        }
      }
    }

    // Avalia prioridades (espaço, localização, privacidade, comodidades)
    if (preferences.priorities) {
      const size = parseInt(property.features.find(f => f.includes('m²'))?.replace(/\D/g, '') || '0');
      
      if (preferences.priorities.includes('space') && size > 150) {
        score += 15;
      }
      if (preferences.priorities.includes('location') && 
          (property.details.location.includes('Primeira quadra') || 
           property.details.location.includes('Centro'))) {
        score += 15;
      }
      if (preferences.priorities.includes('privacy') && 
          property.features.includes('Condomínio fechado')) {
        score += 15;
      }
      if (preferences.priorities.includes('amenities') && 
          (property.features.includes('Academia') || 
           property.features.includes('Piscina'))) {
        score += 15;
      }
    }

    // Avalia arredores (natureza, serviços, lazer, transporte)
    if (preferences.surrounding) {
      if (preferences.surrounding.includes('nature') && 
          (property.features.includes('Área verde') || 
           property.features.includes('Vista para o mar'))) {
        score += 15;
      }
      if (preferences.surrounding.includes('services') && 
          property.features.includes('Próximo a comércios')) {
        score += 15;
      }
      if (preferences.surrounding.includes('leisure') && 
          (property.features.includes('Piscina') || 
           property.features.includes('Varanda gourmet'))) {
        score += 15;
      }
      if (preferences.surrounding.includes('transport') && 
          property.details.location.includes('Centro')) {
        score += 15;
      }
    }

    // Limita o score a 100
    return Math.min(Math.round(score), 100);
  }

  /**
   * Cria um novo perfil de busca
   * @param {Object} profileData - Dados do perfil
   * @returns {Object} Perfil criado
   */
  createSearchProfile(profileData) {
    const profiles = this.getBuyerProfiles();
    
    const newProfile = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...profileData
    };
    
    profiles.push(newProfile);
    this.setStorageItem(this.KEYS.BUYER_PROFILES, JSON.stringify(profiles));
    
    return newProfile;
  }
  /**
   * Determines if we should use localStorage or sessionStorage
   * @returns {Storage} The appropriate storage object
   */
  getStorageType() {
    // Use localStorage for authenticated users, sessionStorage for others
    const isAuthenticated = localStorage.getItem('authToken') !== null;
    return isAuthenticated ? localStorage : sessionStorage;
  }

  /**
   * Gets an item from the appropriate storage
   * @param {string} key - Storage key
   * @returns {string|null} Stored value
   */
  getStorageItem(key) {
    return this.getStorageType().getItem(key);
  }

  /**
   * Sets an item in the appropriate storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   */
  setStorageItem(key, value) {
    this.getStorageType().setItem(key, value);
  }

  /**
   * Removes an item from the appropriate storage
   * @param {string} key - Storage key
   */
  removeStorageItem(key) {
    this.getStorageType().removeItem(key);
  }

  /**
   * Atualiza um perfil de busca existente
   * @param {string} profileId - ID do perfil
   * @param {Object} profileData - Novos dados do perfil
   * @returns {Object|null} Perfil atualizado ou null se não encontrado
   */
  updateSearchProfile(profileId, profileData) {
    const profiles = this.getBuyerProfiles();
    const index = profiles.findIndex(p => p.id === profileId);
    
    if (index === -1) return null;
    
    const updatedProfile = {
      ...profiles[index],
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    profiles[index] = updatedProfile;
    this.setStorageItem(this.KEYS.BUYER_PROFILES, JSON.stringify(profiles));
    
    return updatedProfile;
  }

  /**
   * Remove um perfil de busca
   * @param {string} profileId - ID do perfil
   * @returns {boolean} Sucesso da operação
   */
  deleteSearchProfile(profileId) {
    const profiles = this.getBuyerProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== profileId);
    
    if (filteredProfiles.length === profiles.length) return false;
    
    this.setStorageItem(this.KEYS.BUYER_PROFILES, JSON.stringify(filteredProfiles));
    
    // Remover matches associados
    this.removeStorageItem(`${this.KEYS.MATCHES_PREFIX}${profileId}`);
    
    // Se for o perfil ativo, remover
    const activeProfile = this.getActiveProfile();
    if (activeProfile && activeProfile.id === profileId) {
      this.removeStorageItem(this.KEYS.ACTIVE_PROFILE);
    }
    
    return true;
  }

  /**
   * Obtém todos os perfis de busca
   * @returns {Array} Array com perfis de busca
   */
  getBuyerProfiles() {
    return JSON.parse(this.getStorageItem(this.KEYS.BUYER_PROFILES) || '[]');
  }

  /**
   * Obtém um perfil de busca específico
   * @param {string} profileId - ID do perfil
   * @returns {Object|null} Perfil encontrado ou null
   */
  getSearchProfileById(profileId) {
    const profiles = this.getBuyerProfiles();
    return profiles.find(p => p.id === profileId) || null;
  }

  /**
   * Define o perfil ativo
   * @param {string} profileId - ID do perfil
   * @returns {Object|null} Perfil ativo ou null se não encontrado
   */
  setActiveProfile(profileId) {
    const profile = this.getSearchProfileById(profileId);
    
    if (!profile) return null;
    
    this.setStorageItem(this.KEYS.ACTIVE_PROFILE, JSON.stringify(profile));
    return profile;
  }

  /**
   * Obtém o perfil ativo
   * @returns {Object|null} Perfil ativo
   */
  getActiveProfile() {
    return JSON.parse(this.getStorageItem(this.KEYS.ACTIVE_PROFILE) || 'null');
  }

  /**
   * Adiciona um imóvel aos matches de um perfil
   * @param {string} profileId - ID do perfil
   * @param {Object} property - Imóvel a ser adicionado
   * @returns {Object} Imóvel adicionado com dados adicionais
   */
  addMatch(profileId, property) {
    const matches = this.getProfileMatches(profileId);
    
    // Verificar se já existe
    if (matches.some(m => m.id === property.id)) {
      return null;
    }
    
    // Adicionar informações extras
    const match = {
      ...property,
      addedAt: new Date().toISOString(),
      profileId,
      notes: '',
      rating: 0
    };
    
    matches.push(match);
    this.setStorageItem(`${this.KEYS.MATCHES_PREFIX}${profileId}`, JSON.stringify(matches));
    
    return match;
  }

  /**
   * Atualiza um match existente
   * @param {string} profileId - ID do perfil
   * @param {number} propertyId - ID do imóvel
   * @param {Object} updates - Dados a serem atualizados
   * @returns {Object|null} Match atualizado ou null
   */
  updateMatch(profileId, propertyId, updates) {
    const matches = this.getProfileMatches(profileId);
    const index = matches.findIndex(m => m.id === propertyId);
    
    if (index === -1) return null;
    
    const updatedMatch = {
      ...matches[index],
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    
    matches[index] = updatedMatch;
    this.setStorageItem(`${this.KEYS.MATCHES_PREFIX}${profileId}`, JSON.stringify(matches));
    
    return updatedMatch;
  }

  /**
   * Remove um match
   * @param {string} profileId - ID do perfil
   * @param {number} propertyId - ID do imóvel
   * @returns {boolean} Sucesso da operação
   */
  removeMatch(profileId, propertyId) {
    const matches = this.getProfileMatches(profileId);
    const filteredMatches = matches.filter(m => m.id !== propertyId);
    
    if (filteredMatches.length === matches.length) return false;
    
    this.setStorageItem(`${this.KEYS.MATCHES_PREFIX}${profileId}`, JSON.stringify(filteredMatches));
    return true;
  }

  /**
   * Obtém todos os matches de um perfil
   * @param {string} profileId - ID do perfil
   * @returns {Array} Array com matches
   */
  getProfileMatches(profileId) {
    return JSON.parse(this.getStorageItem(`${this.KEYS.MATCHES_PREFIX}${profileId}`) || '[]');
  }

  /**
   * Define o imóvel atual para visualização detalhada
   * @param {Object} property - Imóvel
   */
  setCurrentProperty(property) {
    this.setStorageItem(this.KEYS.CURRENT_PROPERTY, JSON.stringify(property));
  }

  /**
   * Obtém o imóvel atual
   * @returns {Object|null} Imóvel atual
   */
  getCurrentProperty() {
    return JSON.parse(this.getStorageItem(this.KEYS.CURRENT_PROPERTY) || 'null');
  }
}

// Exportar instância singleton
const dataService = new DataService();
export default dataService;