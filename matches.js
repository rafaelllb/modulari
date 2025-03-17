/**
 * Matches Page Script
 * Manages user property matches
 */
import dataService from './data-service.js';
import toastService from './toast-service.js';

// State
let sortType = 'match';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if there is an active profile
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) {
        window.location.href = 'profiles.html';
        return;
    }
    
    showMatchesLoading();
    
    // Initialization with some delay to show loading state
    setTimeout(() => {
        initializePage();
    }, 800);
});

/**
 * Initialize the page
 */
function initializePage() {
    try {
        updateStats();
        sortMatches('match');
    } catch (error) {
        console.error('Error initializing matches page:', error);
        showEmptyState();
        toastService.error('Erro ao carregar matches');
    }
}

/**
 * Update statistics section
 */
function updateStats() {
    const activeProfile = dataService.getActiveProfile();
    const matches = dataService.getProfileMatches(activeProfile.id);
    
    if (matches.length === 0) {
        document.getElementById('total-matches').textContent = '0';
        document.getElementById('avg-rating').textContent = '0.0';
        document.getElementById('price-range').textContent = 'R$ 0';
        return;
    }
    
    const totalMatches = matches.length;
    const averageRating = matches.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalMatches;

    // Calculate average price
    const averagePrice = matches.reduce((acc, curr) => {
        const price = parseInt(curr.price.replace(/\D/g, '')) || 0;
        return acc + price;
    }, 0) / totalMatches;

    document.getElementById('total-matches').textContent = totalMatches;
    document.getElementById('avg-rating').textContent = averageRating.toFixed(1);
    document.getElementById('price-range').textContent = 
        `R$ ${averagePrice.toLocaleString('pt-BR')}`;
}

/**
 * Sort matches by different criteria
 * @param {string} type - Sort criteria: 'match', 'rating', 'price', 'date'
 */
window.sortMatches = function(type) {
    sortType = type;
    document.querySelectorAll('.sort-button').forEach(button => {
        button.classList.toggle('active', button.textContent.toLowerCase().includes(type));
    });

    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) return;
    
    const matches = dataService.getProfileMatches(activeProfile.id);
    
    const sortedMatches = [...matches].sort((a, b) => {
        switch (type) {
            case 'match':
                return b.match - a.match;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'price':
                const priceA = parseInt(a.price.replace(/\D/g, '')) || 0;
                const priceB = parseInt(b.price.replace(/\D/g, '')) || 0;
                return priceA - priceB;
            case 'date':
                return new Date(b.lastUpdate || b.addedAt) - new Date(a.lastUpdate || a.addedAt);
            default:
                return 0;
        }
    });

    renderMatches(sortedMatches);
};

/**
 * Render matches in the grid
 * @param {Array} propertiesToRender - Array of matches to render
 */
function renderMatches(propertiesToRender = []) {
    const matchesGrid = document.getElementById('matches-grid');
    
    if (propertiesToRender.length === 0) {
        matchesGrid.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum match encontrado ainda</h3>
                <p>Continue explorando para encontrar o imóvel ideal</p>
                <button class="button button-primary" onclick="window.location.href='property-cards.html'" style="margin-top: var(--spacing-md);">
                    Explorar imóveis
                </button>
            </div>
        `;
        return;
    }

    matchesGrid.innerHTML = propertiesToRender.map(property => `
        <div class="property-card">
            <div class="match-badge">${property.match}% match</div>
            ${checkForChanges(property)}
            <img src="${property.image}" alt="${property.title}" class="property-image">
            <div class="property-content">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-price">${property.price}</p>
                <div class="rating-section">
                    <span>Seu interesse:</span>
                    <div class="rating-stars">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <button class="star-button" 
                                    onclick="updateRating('${property.id}', ${star})">
                                ${star <= (property.rating || 0) ? '★' : '☆'}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="property-features">
                    ${property.features.slice(0, 3).map(feature => `
                        <span class="feature-tag">${feature}</span>
                    `).join('')}
                </div>
                <div class="notes-section">
                    <label class="form-label">Suas anotações:</label>
                    <textarea class="notes-input"
                              placeholder="Adicione suas observações sobre este imóvel"
                              onchange="updateNotes('${property.id}', this.value)">${property.notes || ''}</textarea>
                </div>
                <div class="card-actions">
                    <button class="button button-primary" 
                            onclick="viewDetails('${property.id}')">
                        Ver detalhes
                    </button>
                    <button class="button button-secondary" 
                            onclick="shareProperty('${property.id}')">
                        Compartilhar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Check for property changes
 * @param {Object} property - Property to check for changes
 * @returns {string} HTML for changes badge
 */
function checkForChanges(property) {
    // Simulate checking for changes
    const lastCheck = new Date(property.lastCheck || property.addedAt).getTime();
    const now = new Date().getTime();
    const daysSinceLastCheck = (now - lastCheck) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCheck > 7) {
        const changes = [];
        
        // Simulate price reduction (20% chance)
        if (Math.random() < 0.2) {
            const reduction = Math.floor(Math.random() * 10) + 1;
            changes.push(`Preço reduzido em ${reduction}%`);
        }
        
        // Simulate other changes
        if (Math.random() < 0.1) {
            changes.push('Status alterado');
        }

        if (changes.length > 0) {
            return `
                <div class="changes-badge">
                    ${changes[0]}
                </div>
            `;
        }
    }
    
    return '';
}

/**
 * Update property notes
 * @param {string} propertyId - ID of the property
 * @param {string} notes - New notes text
 */
window.updateNotes = function(propertyId) {
    const notes = event.target.value;
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) return;
    
    const success = dataService.updateMatch(activeProfile.id, propertyId, { notes });
    if (success) {
        toastService.success('Anotações salvas');
    }
};

/**
 * Update property rating
 * @param {string} propertyId - ID of the property
 * @param {number} rating - Rating value (1-5)
 */
window.updateRating = function(propertyId, rating) {
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) return;
    
    const success = dataService.updateMatch(activeProfile.id, propertyId, { rating });
    if (success) {
        toastService.success('Avaliação atualizada');
        sortMatches(sortType); // Refresh the list to reflect changes
    }
};

/**
 * Open property details
 * @param {string} propertyId - ID of the property
 */
window.viewDetails = function(propertyId) {
    const property = dataService.getPropertyById(propertyId);
    if (property) {
        dataService.setCurrentProperty(property);
        window.location.href = 'property-details.html';
    }
};

/**
 * Share property
 * @param {string} propertyId - ID of the property to share
 */
window.shareProperty = function(propertyId) {
    const activeProfile = dataService.getActiveProfile();
    if (!activeProfile) return;
    
    const matches = dataService.getProfileMatches(activeProfile.id);
    const property = matches.find(p => p.id == propertyId);
    
    if (!property) {
        toastService.error('Imóvel não encontrado');
        return;
    }

    // Create text for sharing
    const shareText = `
        🏠 ${property.title}
        💰 ${property.price}
        ✨ Match: ${property.match}%

        ${property.features.join(' • ')}

        Veja mais detalhes em Modulari!
    `.trim();

    // Check if the sharing API is available
    if (navigator.share) {
        navigator.share({
            title: 'Imóvel encontrado no Modulari',
            text: shareText,
            url: window.location.origin + '/property-details.html?id=' + property.id
        }).catch(err => {
            console.error('Erro ao compartilhar:', err);
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    // Create temporary element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // Copy the text
    textarea.select();
    document.execCommand('copy');
    
    // Remove temporary element
    document.body.removeChild(textarea);
    
    toastService.success('Informações copiadas para a área de transferência!');
}

/**
 * Show loading state
 */
function showMatchesLoading() {
    const grid = document.getElementById('matches-grid');
    grid.innerHTML = Array(6).fill().map(() => `
        <div class="property-card loading">
        <div style="height: 200px;"></div>
        </div>
    `).join('');
}

/**
 * Show empty state
 */
function showEmptyState() {
    const grid = document.getElementById('matches-grid');
    grid.innerHTML = `
        <div class="empty-state">
        <h3>Nenhum match encontrado</h3>
        <p>Continue explorando para encontrar o imóvel ideal</p>
        <button onclick="window.location.href='property-cards.html'" 
                class="button button-primary mt-4">
            Explorar imóveis
        </button>
        </div>
    `;
}

// Global functions
window.sortMatches = sortMatches;
window.updateNotes = updateNotes;
window.updateRating = updateRating;
window.viewDetails = viewDetails;
window.shareProperty = shareProperty;