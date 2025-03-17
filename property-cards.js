/**
 * Script para a página de cards de propriedades
 * Melhora a experiência de navegação e integração com o serviço de dados
 */
import dataService from './data-service.js';
import permissionService from './permission-service.js';

// Estado da aplicação
let currentIndex = 0;
let matchesCount = 0;
let currentView = 'cards';
let properties = [];
let isLoading = true;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar se há um perfil ativo
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) {
        window.location.href = 'profiles.html';
        return;
    }

    // Mostrar informações do perfil
    renderProfileInfo(activeProfile);

    // Mostrar loading cards
    showLoadingCards();

    try {
        // Carregar propriedades baseadas no lifestyle
        const lifestyle = activeProfile.lifestyle || 'beach';
        let lifestyleProperties = dataService.getPropertiesByLifestyle(lifestyle);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Calcular scores de match e ordenar por match
        properties = lifestyleProperties.map(property => ({
            ...property,
            match: dataService.calculateMatchScore(property, activeProfile.preferences)
        })).sort((a, b) => b.match - a.match);
        
        // Carregar matches existentes
        const matches = dataService.getProfileMatches(activeProfile.id);
        matchesCount = matches.length;
        document.getElementById('matches-count').textContent = `${matchesCount} matches`;
        
        // Renderizar as propriedades
        isLoading = false;
        if (currentView === 'cards') {
            renderPropertyCard();
        } else {
            renderPropertyGrid();
        }
    } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
        showError();
    }
});

/**
 * Renderiza informações do perfil ativo
 * @param {Object} profile - Perfil ativo
 */
function renderProfileInfo(profile) {
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileIcon').textContent = getLifestyleIcon(profile.lifestyle);
    
    const preferencesContainer = document.getElementById('profilePreferences');
    const preferencesList = formatPreferences(profile.preferences);
    
    preferencesContainer.innerHTML = preferencesList.map(pref => `
        <div class="preference-tag">
            <span>${pref.icon}</span> ${pref.text}
        </div>
    `).join('');
    
    document.getElementById('profile-level').textContent = `Nível ${getProfileLevel(profile)}`;
    document.getElementById('profile-status').textContent = getProfileStatus(profile);
}

/**
 * Obtém o ícone com base no lifestyle
 * @param {string} lifestyle - Tipo de lifestyle
 * @returns {string} Emoji do lifestyle
 */
function getLifestyleIcon(lifestyle) {
    switch (lifestyle) {
        case 'beach': return '🌊';
        case 'city': return '🌆';
        case 'countryside': return '🌳';
        default: return '🏠';
    }
}

/**
 * Formata as preferências para exibição
 * @param {Object} preferences - Preferências do usuário
 * @returns {Array} Array de preferências formatadas
 */
function formatPreferences(preferences) {
    const items = [];
    
    if (preferences.purpose) {
        items.push({
            icon: preferences.purpose === 'live' ? '🏠' : 
                  preferences.purpose === 'invest' ? '💰' : '🔄',
            text: preferences.purpose === 'live' ? 'Morar' : 
                  preferences.purpose === 'invest' ? 'Investir' : 'Morar e Investir'
        });
    }

    if (preferences.lifestyle) {
        items.push({
            icon: preferences.lifestyle === 'quiet' ? '🌿' : 
                  preferences.lifestyle === 'active' ? '🎉' : '⚖️',
            text: preferences.lifestyle === 'quiet' ? 'Ambiente Tranquilo' : 
                  preferences.lifestyle === 'active' ? 'Ambiente Movimentado' : 'Ambiente Equilibrado'
        });
    }

    if (preferences.priorities && preferences.priorities.length > 0) {
        const priorityText = preferences.priorities.length === 1 ? 
            preferences.priorities[0] :
            `${preferences.priorities.length} prioridades`;
            
        items.push({
            icon: '⭐',
            text: priorityText
        });
    }

    return items;
}

/**
 * Calcula o nível do perfil
 * @param {Object} profile - Perfil do usuário
 * @returns {number} Nível do perfil
 */
function getProfileLevel(profile) {
    // Verificar data de criação
    const createdAt = new Date(profile.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    // Verificar quantidade de matches
    const matches = dataService.getProfileMatches(profile.id);
    
    // Calcular nível
    let level = 1;
    if (daysSinceCreation > 7 || matches.length >= 5) level = 2;
    if (daysSinceCreation > 30 || matches.length >= 20) level = 3;
    
    return level;
}

/**
 * Obtém o status do perfil
 * @param {Object} profile - Perfil do usuário
 * @returns {string} Status do perfil
 */
function getProfileStatus(profile) {
    const matches = dataService.getProfileMatches(profile.id);
    
    if (matches.length < 3) return 'Explorador';
    if (matches.length < 10) return 'Conhecedor';
    return 'Expert';
}

/**
 * Mostra cards em loading
 */
function showLoadingCards() {
    const cardStack = document.getElementById('card-stack');
    cardStack.innerHTML = `
        <div class="property-card loading">
            <div style="height: 300px;"></div>
            <div class="property-content">
                <div class="skeleton" style="height: 24px; width: 80%; margin-bottom: 8px;"></div>
                <div class="skeleton" style="height: 18px; width: 60%; margin-bottom: 16px;"></div>
            </div>
        </div>
    `;
}

/**
 * Mostra mensagem de erro
 */
function showError() {
    const cardStack = document.getElementById('card-stack');
    cardStack.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🏠</div>
            <h3>Erro ao carregar imóveis</h3>
            <p>Não foi possível carregar os imóveis no momento</p>
            <button onclick="location.reload()" class="button button-primary" style="margin-top: var(--spacing-md);">
                Tentar novamente
            </button>
        </div>
    `;
}

/**
 * Alterna entre visualizações de cards e grid
 * @param {string} view - 'cards' ou 'grid'
 */
window.switchView = function(view) {
    const cardsView = document.getElementById('cards-view');
    const gridView = document.getElementById('grid-view');
    const cardsBtn = document.getElementById('cards-view-btn');
    const gridBtn = document.getElementById('grid-view-btn');
    const container = document.querySelector('.container');

    currentView = view;

    if (view === 'cards') {
        cardsView.style.display = 'block';
        gridView.style.display = 'none';
        cardsBtn.classList.add('active');
        gridBtn.classList.remove('active');
        container.classList.remove('grid-mode');
        
        if (!isLoading && properties.length > 0 && !document.querySelector('.property-card')) {
            renderPropertyCard();
        }
    } else {
        cardsView.style.display = 'none';
        gridView.style.display = 'grid';
        cardsBtn.classList.remove('active');
        gridBtn.classList.add('active');
        container.classList.add('grid-mode');
        
        if (!isLoading) {
            renderPropertyGrid();
        }
    }
};

/**
 * Renderiza o card de propriedade atual
 */
function renderPropertyCard() {
    if (properties.length === 0 || currentIndex >= properties.length) {
        showNoMoreProperties();
        return;
    }
    
    const cardStack = document.getElementById('card-stack');
    const property = properties[currentIndex];
    const card = createPropertyCard(property);
    
    // Limpar stack e adicionar novo card
    cardStack.innerHTML = '';
    cardStack.appendChild(card);
    
    // Inicializar funcionalidade de arrastar
    initializeDrag(card);
}

/**
 * Cria um elemento de card de propriedade
 * @param {Object} property - Dados da propriedade
 * @returns {HTMLElement} Elemento do card
 */
function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    const tips = generatePersonalizedTips(property);
    
    card.innerHTML = `
        <div class="match-badge ${property.match > 90 ? 'high-match' : ''}">${property.match}% match</div>
        <img src="${property.image}" alt="${property.title}" class="property-image">
        <div class="property-content">
            <h2 class="property-title">${property.title}</h2>
            <p class="property-price">${property.price}</p>
            ${tips ? `<div class="property-tips">${tips}</div>` : ''}
            <div class="property-features">
                ${property.features.map(feature => `
                    <span class="feature-tag">${feature}</span>
                `).join('')}
            </div>
            <div class="action-buttons">
                <button class="action-button dislike-button" onclick="handleChoice(false)">❌</button>
                <button class="action-button info-button" onclick="showDetails(${property.id})">ℹ️</button>
                <button class="action-button like-button" onclick="handleChoice(true)">💚</button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Gera dicas personalizadas para a propriedade
 * @param {Object} property - Dados da propriedade
 * @returns {string} HTML das dicas
 */
function generatePersonalizedTips(property) {
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile || !activeProfile.preferences) return '';
    
    const tips = [];
    const preferences = activeProfile.preferences;
    
    if (property.match > 90) {
        tips.push('✨ Match perfeito para seu perfil!');
    }

    if (preferences.purpose === 'invest' && property.details?.investmentPotential) {
        tips.push('💰 Ótimo potencial de valorização');
    }

    if (preferences.lifestyle === 'quiet' && 
        (property.details?.noiseLevel === 'low' || property.details?.noiseLevel === 'very_low')) {
        tips.push('🌟 Localização tranquila ideal');
    }

    const size = parseInt(property.features.find(f => f.includes('m²'))?.replace(/\D/g, '') || '0');
    if (preferences.priorities?.includes('space') && size > 150) {
        tips.push('📐 Espaço amplo como você procura');
    }

    return tips.length > 0 ? tips.slice(0, 2).map(tip => `<div class="tip">${tip}</div>`).join('') : '';
}

/**
 * Mostra mensagem quando não houver mais propriedades
 */
function showNoMoreProperties() {
    const cardStack = document.getElementById('card-stack');
    
    cardStack.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🎉</div>
            <h3>Você viu todos os imóveis!</h3>
            <p>Não há mais imóveis para mostrar no momento.</p>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                <button onclick="window.location.href='matches.html'" class="button button-primary">
                    Ver seus matches (${matchesCount})
                </button>
                <button onclick="resetCards()" class="button button-secondary">
                    Começar novamente
                </button>
            </div>
        </div>
    `;
}

/**
 * Reinicia a navegação de cards
 */
window.resetCards = function() {
    currentIndex = 0;
    renderPropertyCard();
};

/**
 * Renderiza o grid de propriedades
 */
function renderPropertyGrid() {
    const gridView = document.getElementById('grid-view');
    document.querySelector('.container').classList.add('grid-mode');
    
    if (properties.length === 0) {
        gridView.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🏠</div>
                <h3>Nenhum imóvel encontrado</h3>
                <p>Não existem imóveis disponíveis para este perfil no momento.</p>
            </div>
        `;
        return;
    }
    
    gridView.innerHTML = properties.map((property, index) => {
        const features = property.features
            .slice(0, 3)
            .map(feature => `<span class="feature-tag">${feature}</span>`)
            .join('');
            
        return `
            <div class="property-card">
                <div class="match-badge ${property.match > 90 ? 'high-match' : ''}">${property.match}% match</div>
                <img src="${property.image}" alt="${property.title}" class="property-image">
                <div class="property-content">
                    <h2 class="property-title">${property.title}</h2>
                    <p class="property-price">${property.price}</p>
                    <div class="property-features">
                        ${features}
                    </div>
                    <div class="grid-actions">
                        <button class="grid-button like" onclick="handleGridChoice(${index}, true)">
                            <span>💚</span> Gostei
                        </button>
                        <button class="grid-button info" onclick="showDetails(${property.id})">
                            <span>ℹ️</span> Detalhes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Inicializa funcionalidade de arrastar para cards
 * @param {HTMLElement} element - Elemento do card
 */
function initializeDrag(element) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    element.addEventListener('mousedown', startDragging);
    element.addEventListener('touchstart', (e) => {
        startDragging(e.touches[0]);
    });

    function startDragging(e) {
        isDragging = true;
        startX = e.clientX - currentX;
        element.classList.add('dragging');
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        drag(e);
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        drag(e.touches[0]);
    });

    function drag(e) {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        element.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.1}deg)`;
        
        const likeIndicator = document.querySelector('.choice-like');
        const nopeIndicator = document.querySelector('.choice-nope');
        
        if (currentX > 100) {
            likeIndicator.style.opacity = currentX / 500;
        } else if (currentX < -100) {
            nopeIndicator.style.opacity = Math.abs(currentX) / 500;
        } else {
            likeIndicator.style.opacity = 0;
            nopeIndicator.style.opacity = 0;
        }
    }

    document.addEventListener('mouseup', endDragging);
    document.addEventListener('touchend', endDragging);

    function endDragging() {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging');
        
        if (currentX > 100) {
            handleChoice(true);
        } else if (currentX < -100) {
            handleChoice(false);
        } else {
            element.style.transform = '';
        }
        
        document.querySelector('.choice-like').style.opacity = 0;
        document.querySelector('.choice-nope').style.opacity = 0;
    }
}

/**
 * Trata a escolha do usuário (like/dislike)
 * @param {boolean} liked - Se o usuário gostou da propriedade
 */
window.handleChoice = function(liked) {
    try {
        const currentCard = document.querySelector('.property-card');
        if (!currentCard || isLoading) return;

        const currentProperty = properties[currentIndex];

        const direction = liked ? 1 : -1;
        currentCard.style.transform = `translateX(${direction * window.innerWidth}px) rotate(${direction * 30}deg)`;
        
        if (liked && currentProperty) {
            saveMatch(currentProperty);
            showToast('Imóvel adicionado aos seus matches!', 'success');
        } else {
            showToast('Imóvel descartado', 'warning');
        }

        setTimeout(() => {
            currentCard.remove();
            currentIndex++;
            
            if (currentIndex < properties.length) {
                renderPropertyCard();
            } else {
                showNoMoreProperties();
            }
        }, 300);
    } catch (error) {
        console.error('Erro ao processar escolha:', error);
        showToast('Erro ao processar sua escolha', 'error');
    }
};

/**
 * Trata a escolha do usuário na visualização em grid
 * @param {number} index - Índice da propriedade
 * @param {boolean} liked - Se o usuário gostou da propriedade
 */
window.handleGridChoice = function(index, liked) {
    if (isLoading) return;
    
    const property = properties[index];
    const card = document.querySelectorAll('.property-card')[index];
    
    if (liked) {
        saveMatch(property);
        
        card.style.transform = 'scale(0.9)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            // Remover ou esconder o card
            card.style.display = 'none';
            
            // Verificar se ainda há cards visíveis
            const visibleCards = Array.from(document.querySelectorAll('.property-card'))
                .filter(c => c.style.display !== 'none');
            
            if (visibleCards.length === 0) {
                document.getElementById('grid-view').innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🎉</div>
                        <h3>Você viu todos os imóveis!</h3>
                        <p>Acesse seus matches ou atualize a página para ver novamente.</p>
                        <button onclick="window.location.href='matches.html'" class="button button-primary" style="margin-top: var(--spacing-md);">
                            Ver matches (${matchesCount})
                        </button>
                    </div>
                `;
            }
        }, 300);
    }
};

/**
 * Salva um match
 * @param {Object} property - Propriedade para salvar como match
 */
function saveMatch(property) {
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) return;
    
    // Verificar se já está nos matches
    const matches = dataService.getProfileMatches(activeProfile.id);
    if (matches.some(m => m.id === property.id)) return;
    
    // Adicionar às matches
    dataService.addMatch(activeProfile.id, property);
    matchesCount++;
    document.getElementById('matches-count').textContent = `${matchesCount} matches`;
}

/**
 * Mostra detalhes de uma propriedade
 * @param {number} propertyId - ID da propriedade
 */
window.showDetails = function(propertyId) {
    const property = dataService.getPropertyById(propertyId);
    if (property) {
        dataService.setCurrentProperty(property);
        window.location.href = 'property-details.html';
    }
};

/**
 * Mostra um toast de notificação
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Exportar função para mostrar toast no escopo global
window.showToast = showToast;