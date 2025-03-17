/**
 * Profiles Page Script
 * Manages user search profiles
 */
import dataService from './data-service.js';
import toastService from './toast-service.js';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // If no profiles exist, redirect to index
    const profiles = dataService.getBuyerProfiles();
    if (!profiles.length) {
        window.location.href = 'index.html';
        return;
    }
    
    // Render profiles
    renderProfiles();
});

/**
 * Renders all buyer profiles
 */
function renderProfiles() {
    const profilesGrid = document.getElementById('profiles-grid');
    const activeProfileId = dataService.getActiveProfile()?.id;
    const buyerProfiles = dataService.getBuyerProfiles();
    
    let html = `
        <div class="new-profile-card" onclick="createNewProfile()">
            <div class="lifestyle-icon">+</div>
            <h3 class="title-sm">Criar Novo Perfil</h3>
            <p class="text-body">Inicie um novo perfil de busca</p>
        </div>
    `;

    buyerProfiles.forEach(profile => {
        const matches = dataService.getProfileMatches(profile.id);
        const stats = calculateMatchesStats(matches);
        const preferences = formatPreferences(profile.preferences);

        html += `
            <div class="profile-card">
                ${profile.id === activeProfileId ? 
                    '<div class="active-badge">Ativo</div>' : ''}
                <div class="profile-header">
                    <div class="lifestyle-icon">
                        ${getLifestyleIcon(profile.lifestyle)}
                    </div>
                    <div class="profile-info">
                        <h3 class="profile-name">${profile.name}</h3>
                        <div class="profile-meta">
                            <span>Criado em ${new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-value">${stats.totalMatches}</div>
                        <div class="stat-label">Matches</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.avgMatch}%</div>
                        <div class="stat-label">Match Médio</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${stats.avgRating}</div>
                        <div class="stat-label">Avaliação Média</div>
                    </div>
                </div>

                <div class="preferences-section">
                    <h4 class="preferences-title">Preferências</h4>
                    <div class="preferences-grid">
                        ${preferences.map(pref => `
                            <div class="preference-item">
                                <span>${pref.icon}</span>
                                <span>${pref.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${matches.length > 0 ? `
                    <div class="matches-preview">
                        <h4 class="preferences-title">Últimos Matches</h4>
                        ${matches.slice(0, 2).map(match => `
                            <div class="match-item">
                                <img src="${match.image}" alt="${match.title}" class="match-image">
                                <div class="match-info">
                                    <div class="match-title">${match.title}</div>
                                    <div class="match-price">${match.price}</div>
                                    <div class="match-rating">
                                        ${Array(5).fill('').map((_, i) => 
                                            `<span>${i < (match.rating || 0) ? '★' : '☆'}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="profile-actions">
                    ${profile.id === activeProfileId ? `
                        <button class="button button-primary" onclick="viewMatches('${profile.id}')">
                            Ver Matches
                        </button>
                    ` : `
                        <button class="button button-primary" onclick="activateProfile('${profile.id}')">
                            Usar este perfil
                        </button>
                    `}
                    <button class="button button-secondary" onclick="deleteProfile('${profile.id}')">
                        Excluir
                    </button>
                </div>
            </div>
        `;
    });

    profilesGrid.innerHTML = html;
}

/**
 * Calculate statistics for matches
 * @param {Array} matches - Array of matches
 * @returns {Object} Statistics object
 */
function calculateMatchesStats(matches) {
    if (matches.length === 0) {
        return { avgMatch: 0, avgRating: 0, totalMatches: 0 };
    }

    const avgMatch = matches.reduce((acc, m) => acc + m.match, 0) / matches.length;
    const avgRating = matches.reduce((acc, m) => acc + (m.rating || 0), 0) / matches.length;

    return {
        avgMatch: Math.round(avgMatch),
        avgRating: avgRating.toFixed(1),
        totalMatches: matches.length
    };
}

/**
 * Get emoji icon for lifestyle
 * @param {string} lifestyle - Type of lifestyle
 * @returns {string} Emoji icon
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
 * Format preferences for display
 * @param {Object} preferences - User preferences
 * @returns {Array} Formatted preferences
 */
function formatPreferences(preferences) {
    if (!preferences) return [];
    
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

    return items;
}

/**
 * Start creating a new profile
 */
window.createNewProfile = function() {
    localStorage.removeItem('preferences');
    localStorage.removeItem('selectedLifestyle');
    window.location.href = 'index.html';
};

/**
 * Activate a profile
 * @param {string} profileId - ID of profile to activate
 */
window.activateProfile = function(profileId) {
    const profile = dataService.setActiveProfile(profileId);
    if (profile) {
        toastService.success('Perfil ativado com sucesso!');
        window.location.href = 'property-cards.html';
    } else {
        toastService.error('Erro ao ativar perfil');
    }
};

/**
 * View matches for a profile
 * @param {string} profileId - ID of profile to view matches
 */
window.viewMatches = function(profileId) {
    window.location.href = 'matches.html';
};

/**
 * Delete a profile
 * @param {string} profileId - ID of profile to delete
 */
window.deleteProfile = function(profileId) {
    if (confirm('Tem certeza que deseja excluir este perfil? Todos os matches associados serão perdidos.')) {
        const activeProfileId = dataService.getActiveProfile()?.id;
        const success = dataService.deleteSearchProfile(profileId);
        
        if (success) {
            if (dataService.getBuyerProfiles().length === 0) {
                // If no profiles left, redirect to index
                window.location.href = 'index.html';
            } else {
                toastService.success('Perfil excluído com sucesso!');
                
                // If the active profile was deleted, redirect to profiles
                if (profileId === activeProfileId) {
                    window.location.reload();
                } else {
                    renderProfiles();
                }
            }
        } else {
            toastService.error('Erro ao excluir perfil');
        }
    }
};

// Export functions to global scope
window.createNewProfile = createNewProfile;
window.activateProfile = activateProfile;
window.viewMatches = viewMatches;
window.deleteProfile = deleteProfile;