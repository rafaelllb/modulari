/**
 * Index.js - Main script for the Modulari homepage
 * Handles the initialization of the page, user authentication checks,
 * and the dynamic loading of either the questionnaire or conversation interface
 */
import dataService from './data-service.js';
import permissionService from './modulari/service/permission-service.js';
import toastService from './toast-service.js';
import { renderHeader } from './header-component.js';

// Export these functions to the global scope for HTML onclick handlers
window.selectLifestyle = selectLifestyle;
window.selectInteractionMode = selectInteractionMode;

/**
 * Initialize the page when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Render the header component
        renderHeader('header-content');
        
        // Show loading state
        showLoadingLifestyles();
        
        // Check authentication and update UI
        if (permissionService.isAuthenticated()) {
            updateUIForAuthenticatedUser();
            
            if (permissionService.needsTokenRefresh()) {
                await permissionService.refreshToken();
            }
        }
        
        // Check saved profiles
        const profilesButton = document.getElementById('profilesButton');
        if (profilesButton) {
            checkSavedProfiles();
        } else {
            console.warn('profilesButton element not found, skipping profile check');
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Detect preferred interaction mode (if user has used the system before)
        const preferredMode = localStorage.getItem('preferredInteractionMode') || 'discovery';
        
        // Initialize interface with the preferred mode
        selectInteractionMode(preferredMode);
        
        // Render lifestyle options for the questionnaire mode
        renderLifestyleOptions();
        
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        const lifestyleGrid = document.getElementById('lifestyle-grid');
        if (lifestyleGrid) {
            lifestyleGrid.innerHTML = 
                '<div class="error-state">Erro ao carregar estilos de vida</div>';
        }
        toastService.error('Erro ao inicializar a aplicação');
    }
});

/**
 * Selects a lifestyle option and redirects to discovery page
 * @param {string} lifestyle - The selected lifestyle ('beach', 'city', 'countryside')
 */
function selectLifestyle(lifestyle) {
    dataService.saveSelectedLifestyle(lifestyle);
    window.location.href = 'discovery.html';
}

/**
 * Selects the interaction mode (questionnaire or conversation)
 * @param {string} mode - 'discovery' or 'conversation'
 */
function selectInteractionMode(mode) {
    const container = document.getElementById('interaction-container');
    const discoveryOption = document.getElementById('discovery-option');
    const conversationOption = document.getElementById('conversation-option');
    
    // Highlight selected option
    if (mode === 'conversation') {
        conversationOption.classList.add('highlighted');
        discoveryOption.classList.remove('highlighted');
        
        // Initialize conversation interface
        initConversationInterface(container);
    } else {
        discoveryOption.classList.add('highlighted');
        conversationOption.classList.remove('highlighted');
        
        // Initialize questionnaire interface
        initDiscoveryInterface(container);
    }
    
    // Save user preference
    localStorage.setItem('preferredInteractionMode', mode);
}

/**
 * Initialize the conversation interface
 * @param {HTMLElement} container - Container to inject the interface
 */
function initConversationInterface(container) {
    // Load conversation template
    fetch('templates/conversation-template.html')
        .then(response => response.text())
        .then(template => {
            container.innerHTML = template;
            
            // Initialize conversation service
            const conversationService = new ConversationService();
            const session = conversationService.initConversation();
            
            // Set up event handlers
            setupConversationEventHandlers(conversationService, session);
            
            // Show initial message
            displayInitialMessage();
        })
        .catch(error => {
            console.error('Erro ao carregar template de conversa:', error);
            // Fallback to questionnaire in case of error
            initDiscoveryInterface(container);
        });
}

/**
 * Initialize the questionnaire discovery interface
 * @param {HTMLElement} container - Container to inject the interface
 */
function initDiscoveryInterface(container) {
    container.innerHTML = `
        <div class="lifestyle-grid" id="lifestyle-grid">
            <!-- Cards will be loaded dynamically -->
        </div>
    `;
    
    renderLifestyleOptions();
}

/**
 * Sets up the event handlers for the conversation interface
 * @param {ConversationService} service - Conversation service instance
 * @param {Object} session - Current conversation session
 */
function setupConversationEventHandlers(service, session) {
    const inputField = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    if (!inputField || !sendButton) {
        console.error('Chat input elements not found');
        return;
    }
    
    // Send message on button click
    sendButton.addEventListener('click', () => {
        const message = inputField.value.trim();
        if (message) {
            sendUserMessage(service, session.id, message);
            inputField.value = '';
        }
    });
    
    // Send message on Enter key
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = inputField.value.trim();
            if (message) {
                sendUserMessage(service, session.id, message);
                inputField.value = '';
            }
        }
    });
}

/**
 * Sends a user message and processes the response
 * @param {ConversationService} service - Conversation service
 * @param {string} sessionId - ID of the current session
 * @param {string} message - User message text
 */
async function sendUserMessage(service, sessionId, message) {
    // Show user message
    displayUserMessage(message);
    
    try {
        // Process message
        const response = await service.processMessage(sessionId, message);
        
        // Show assistant response
        displayAssistantMessage(response.message);
        
        // Show property suggestions if any
        if (response.suggestedProperties && response.suggestedProperties.length > 0) {
            displayPropertySuggestions(response.suggestedProperties);
        }
        
        // Update identified preferences
        updateIdentifiedPreferences(response.identifiedPreferences);
        
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        displayAssistantMessage("Desculpe, tive um problema ao processar sua mensagem. Poderia tentar novamente?");
    }
}

/**
 * Display a user message in the chat UI
 * @param {string} message - Message to display
 */
function displayUserMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message user';
    messageElement.textContent = message;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom(messagesContainer);
}

/**
 * Display an assistant message in the chat UI
 * @param {string} message - Message to display
 */
function displayAssistantMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message assistant';
    messageElement.textContent = message;
    
    messagesContainer.appendChild(messageElement);
    scrollToBottom(messagesContainer);
}

/**
 * Display the initial welcome message
 */
function displayInitialMessage() {
    displayAssistantMessage("Olá! Eu sou o assistente imobiliário da Modulari. Estou aqui para ajudar você a encontrar o imóvel ideal. Para começar, por que não me conta um pouco sobre o que você está procurando?");
}

/**
 * Show property suggestions in the preview area
 * @param {Array} properties - Array of property objects
 */
function displayPropertySuggestions(properties) {
    const previewContainer = document.getElementById('properties-preview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = properties.map(property => `
        <div class="property-preview" onclick="viewPropertyDetails(${property.id})">
            <img src="${property.image}" alt="${property.title}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div style="padding: 8px;">
                <div style="font-weight: 500;">${property.title}</div>
                <div style="color: var(--success);">${property.price}</div>
                <div style="font-size: 0.75rem; color: var(--primary);">${property.match}% match</div>
            </div>
        </div>
    `).join('');
}

/**
 * Update the identified preferences panel
 * @param {Object} preferences - Object containing identified preferences
 */
function updateIdentifiedPreferences(preferences) {
    const preferencesContainer = document.getElementById('identified-preferences');
    if (!preferencesContainer || !preferences) return;
    
    const preferencesList = [];
    
    if (preferences.purpose) {
        preferencesList.push(`<div class="preference-item">🎯 Objetivo: ${formatPurpose(preferences.purpose)}</div>`);
    }
    
    if (preferences.lifestyle) {
        preferencesList.push(`<div class="preference-item">🌿 Estilo: ${formatLifestyle(preferences.lifestyle)}</div>`);
    }
    
    if (preferences.priorities && preferences.priorities.length > 0) {
        preferencesList.push(`<div class="preference-item">⭐ Prioridades: ${preferences.priorities.join(', ')}</div>`);
    }
    
    if (preferences.surrounding && preferences.surrounding.length > 0) {
        preferencesList.push(`<div class="preference-item">🏙️ Arredores: ${preferences.surrounding.join(', ')}</div>`);
    }
    
    preferencesContainer.innerHTML = preferencesList.length > 0 
        ? preferencesList.join('') 
        : '<div>Ainda não foi possível identificar suas preferências. Continue a conversa para que eu possa entender melhor.</div>';
}

/**
 * Format purpose value for display
 * @param {string} purpose - Raw purpose value
 * @returns {string} Formatted purpose text
 */
function formatPurpose(purpose) {
    switch (purpose) {
        case 'live': return 'Morar';
        case 'invest': return 'Investir';
        case 'both': return 'Morar e Investir';
        default: return purpose;
    }
}

/**
 * Format lifestyle value for display
 * @param {string} lifestyle - Raw lifestyle value
 * @returns {string} Formatted lifestyle text
 */
function formatLifestyle(lifestyle) {
    switch (lifestyle) {
        case 'quiet': return 'Tranquilo';
        case 'active': return 'Movimentado';
        case 'balanced': return 'Equilibrado';
        default: return lifestyle;
    }
}

/**
 * Scroll a container to the bottom
 * @param {HTMLElement} container - Container to scroll
 */
function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
}

/**
 * Show loading indicator for lifestyle cards
 */
function showLoadingLifestyles() {
    const lifestyleGrid = document.getElementById('lifestyle-grid');
    if (!lifestyleGrid) return;
    
    lifestyleGrid.innerHTML = Array(3).fill().map(() => `
        <div class="lifestyle-card loading"></div>
    `).join('');
}

/**
 * Render lifestyle option cards
 */
function renderLifestyleOptions() {
    const lifestyleGrid = document.getElementById('lifestyle-grid');
    if (!lifestyleGrid) return;
    
    const lifestyles = [
        {
            id: 'beach',
            title: 'Vida Litorânea',
            icon: '🌊',
            description: 'Desperte com a brisa do mar e viva momentos de tranquilidade à beira-mar.',
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'
        },
        {
            id: 'city',
            title: 'Centro Urbano',
            icon: '🌆',
            description: 'Conectado com a energia da cidade e todas as facilidades urbanas.',
            image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80'
        },
        {
            id: 'countryside',
            title: 'Refúgio Natural',
            icon: '🌳',
            description: 'Encontre paz e qualidade de vida em meio à natureza.',
            image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
        }
    ];
    
    lifestyleGrid.innerHTML = lifestyles.map(lifestyle => `
        <div class="lifestyle-card" onclick="selectLifestyle('${lifestyle.id}')">
            <img src="${lifestyle.image}" alt="${lifestyle.title}" class="lifestyle-image">
            <div class="lifestyle-content">
                <h3 class="lifestyle-title">
                    <span>${lifestyle.icon}</span>
                    ${lifestyle.title}
                </h3>
                <p class="lifestyle-description">${lifestyle.description}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Check for saved search profiles
 */
function checkSavedProfiles() {
    const profilesButton = document.getElementById('profilesButton');
    
    if (profilesButton) {
        const profiles = dataService.getBuyerProfiles();
        
        if (profiles.length > 0) {
            profilesButton.classList.add('visible');
        } else {
            profilesButton.classList.remove('visible');
        }
    }
}

/**
 * Update UI for authenticated users
 */
function updateUIForAuthenticatedUser() {
    const user = permissionService.getCurrentUser();
    if (!user) return;
    
    // Update header to show user information
    const headerContent = document.querySelector('.header-content');
    
    // Check if the user menu already exists
    if (!document.getElementById('user-menu')) {
        const profilesButton = document.getElementById('profilesButton');
        if (profilesButton) {
            profilesButton.remove();
        }
        
        const userMenuHtml = `
            <div class="user-menu" id="user-menu">
                <button class="user-button">
                    <span class="user-avatar">${user.name ? user.name.charAt(0) : 'U'}</span>
                    <span class="user-name">${user.name || 'Usuário'}</span>
                </button>
                <div class="user-dropdown">
                    <a href="profile.html">Meu Perfil</a>
                    <a href="profiles.html">Meus Perfis de Busca</a>
                    <a href="matches.html">Meus Matches</a>
                    ${permissionService.hasRole('admin') ? '<a href="dashboard.html">Administração</a>' : ''}
                    <a href="#" id="logout-button">Sair</a>
                </div>
            </div>
        `;
        
        headerContent.insertAdjacentHTML('beforeend', userMenuHtml);
        
        // Add event listener for logout button
        document.getElementById('logout-button').addEventListener('click', (e) => {
            e.preventDefault();
            permissionService.logout();
        });
        
        // Toggle dropdown
        document.querySelector('.user-button').addEventListener('click', () => {
            document.querySelector('.user-dropdown').classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                document.querySelector('.user-dropdown').classList.remove('active');
            }
        });
    }
}

// Make these functions available in the global scope for access from HTML
window.displayUserMessage = displayUserMessage;
window.displayAssistantMessage = displayAssistantMessage;
window.showLoadingLifestyles = showLoadingLifestyles;
window.renderLifestyleOptions = renderLifestyleOptions;
window.viewPropertyDetails = function(propertyId) {
    const property = dataService.getPropertyById(propertyId);
    if (property) {
        dataService.setCurrentProperty(property);
        window.location.href = 'property-details.html';
    }
};

/**
 * Temporary stub for ConversationService class
 * This would be replaced by the actual implementation in conversation-service.js
 */
class ConversationService {
    constructor() {
        this.sessionId = 'session_' + Date.now();
    }
    
    initConversation() {
        return {
            id: this.sessionId,
            startedAt: new Date().toISOString(),
            messages: []
        };
    }
    
    async processMessage(sessionId, message) {
        // This is a simplified placeholder
        // In the actual implementation, this would process the message using NLP
        // and return appropriate responses
        
        console.log(`Processing message in session ${sessionId}: ${message}`);
        
        // Simple keyword-based responses for demonstration
        let responseMessage = "Entendi! Vou ajudar você a encontrar o imóvel perfeito.";
        const suggestedProperties = [];
        
        const activeProfile = dataService.getActiveProfile();
        
        // Detect lifestyle keywords
        const lifestyleKeywords = {
            beach: ['praia', 'mar', 'litoral', 'oceano', 'beira mar'],
            city: ['cidade', 'centro', 'urbano', 'metrô', 'movimentado'],
            countryside: ['campo', 'rural', 'natureza', 'sítio', 'fazenda', 'tranquilo']
        };
        
        let detectedLifestyle = null;
        
        for (const [lifestyle, keywords] of Object.entries(lifestyleKeywords)) {
            if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
                detectedLifestyle = lifestyle;
                break;
            }
        }
        
        if (detectedLifestyle) {
            responseMessage = `Percebi que você está interessado em imóveis na ${detectedLifestyle === 'beach' ? 'praia' : detectedLifestyle === 'city' ? 'cidade' : 'área rural'}. Ótima escolha!`;
            
            // Fetch some properties based on detected lifestyle
            const properties = dataService.getPropertiesByLifestyle(detectedLifestyle);
            
            if (properties && properties.length > 0) {
                const topProperties = properties.slice(0, 2).map(property => ({
                    ...property,
                    match: dataService.calculateMatchScore(property, activeProfile?.preferences || {})
                }));
                
                if (topProperties.length > 0) {
                    responseMessage += " Aqui estão algumas opções que podem te interessar:";
                    suggestedProperties.push(...topProperties);
                }
            }
        }
        
        // Simple preference extraction
        const identifiedPreferences = {};
        
        if (message.toLowerCase().includes('morar')) {
            identifiedPreferences.purpose = 'live';
        } else if (message.toLowerCase().includes('invest')) {
            identifiedPreferences.purpose = 'invest';
        } else if (message.toLowerCase().includes('ambos') || 
                  (message.toLowerCase().includes('morar') && message.toLowerCase().includes('invest'))) {
            identifiedPreferences.purpose = 'both';
        }
        
        if (message.toLowerCase().includes('tranquil')) {
            identifiedPreferences.lifestyle = 'quiet';
        } else if (message.toLowerCase().includes('movimentad') || message.toLowerCase().includes('agitad')) {
            identifiedPreferences.lifestyle = 'active';
        } else if (message.toLowerCase().includes('equilibr') || message.toLowerCase().includes('balanc')) {
            identifiedPreferences.lifestyle = 'balanced';
        }
        
        // Return the response
        return {
            message: responseMessage,
            suggestedProperties,
            identifiedPreferences
        };
    }
}
