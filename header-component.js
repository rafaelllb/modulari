/**
 * Improved Header Component
 * Reusable header with authentication state awareness and consistent profile/login buttons
 */
export function renderHeader(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check authentication status
    const isLoggedIn = localStorage.getItem('authToken') !== null;
    
    // Get user data if available
    let userData = null;
    if (isLoggedIn) {
        const userDataStr = localStorage.getItem('userData');
        userData = userDataStr ? JSON.parse(userDataStr) : { name: 'Usuário' };
    }

    // Check if profiles exist (in localStorage or sessionStorage)
    const hasProfiles = checkForProfiles();

    // Render appropriate header based on auth status
    container.innerHTML = `
        <div class="header-content">
            <h1 class="logo">Modulari</h1>
            <div class="header-actions">
                ${isLoggedIn ? `
                    ${hasProfiles ? `
                        <button class="button button-secondary" style="margin-right: 8px;" onclick="window.location.href='profiles.html'">
                            Meus Perfis
                        </button>
                    ` : ''}
                    <div class="user-menu" id="user-menu">
                        <button class="user-button">
                            <span class="user-avatar">${userData.name ? userData.name.charAt(0) : 'U'}</span>
                            <span class="user-name">${userData.name || 'Usuário'}</span>
                        </button>
                        <div class="user-dropdown">
                            <a href="profile.html">Meu Perfil</a>
                            <a href="profiles.html">Meus Perfis de Busca</a>
                            <a href="matches.html">Meus Matches</a>
                            ${userData.role === 'admin' ? '<a href="dashboard.html">Administração</a>' : ''}
                            <a href="#" id="logout-button">Sair</a>
                        </div>
                    </div>
                ` : `
                    ${hasProfiles ? `
                        <button class="button button-secondary" style="margin-right: 8px;" onclick="window.location.href='profiles.html'">
                            Meus Perfis
                        </button>
                    ` : ''}
                    <button class="button button-secondary" onclick="window.location.href='login.html'">
                        Entrar
                    </button>
                `}
            </div>
        </div>
    `;

    // Add event listeners for logged in state
    if (isLoggedIn) {
        // Add event listener for logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
        
        // Toggle dropdown
        const userButton = document.querySelector('.user-button');
        if (userButton) {
            userButton.addEventListener('click', () => {
                document.querySelector('.user-dropdown').classList.toggle('active');
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                const dropdown = document.querySelector('.user-dropdown');
                if (dropdown) dropdown.classList.remove('active');
            }
        });
    }
}

/**
 * Check if user has profiles stored in localStorage or sessionStorage
 * @returns {boolean} True if profiles exist
 */
function checkForProfiles() {
    // Check in localStorage (for logged in users)
    const localProfiles = localStorage.getItem('buyerProfiles');
    if (localProfiles) {
        try {
            const profiles = JSON.parse(localProfiles);
            if (profiles && profiles.length > 0) return true;
        } catch (e) {
            console.error('Error parsing profiles from localStorage:', e);
        }
    }
    
    // Check in sessionStorage (for non-logged in users)
    const sessionProfiles = sessionStorage.getItem('tempActiveProfile');
    if (sessionProfiles) {
        try {
            const profile = JSON.parse(sessionProfiles);
            if (profile) return true;
        } catch (e) {
            console.error('Error parsing profile from sessionStorage:', e);
        }
    }
    
    return false;
}

// Logout function
export function logout() {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiration');
    
    // Redirect to login
    window.location.href = 'login.html';
}