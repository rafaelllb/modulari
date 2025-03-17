/**
 * Header Component
 * Reusable header with authentication state awareness
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

    // Render appropriate header based on auth status
    container.innerHTML = `
        <div class="header-content">
            <h1 class="logo">Modulari</h1>
            <div class="header-actions">
                ${isLoggedIn ? `
                    <div class="user-menu" id="user-menu">
                        <button class="user-button">
                            <span class="user-avatar">${userData.name ? userData.name.charAt(0) : 'U'}</span>
                            <span class="user-name">${userData.name || 'Usuário'}</span>
                        </button>
                        <div class="user-dropdown">
                            <a href="profile.html">Meu Perfil</a>
                            <a href="profiles.html">Meus Perfis de Busca</a>
                            <a href="matches.html">Meus Matches</a>
                            <a href="#" id="logout-button">Sair</a>
                        </div>
                    </div>
                ` : `
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

// Logout function
export function logout() {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiration');
    
    // Redirect to login
    window.location.href = 'login.html';
}