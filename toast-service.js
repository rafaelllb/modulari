/**
 * Toast Notification Service
 * Provides a consistent way to show toast notifications across the application
 */
class ToastService {
    constructor() {
        // Create toast container if it doesn't exist
        this.ensureContainer();
        
        // Toast duration in milliseconds
        this.duration = 3000;
        
        // Maximum number of toasts to show at once
        this.maxToasts = 3;
        
        // Current active toasts
        this.activeToasts = 0;
    }
    
    /**
     * Ensures that the toast container exists in the DOM
     */
    ensureContainer() {
        let container = document.getElementById('toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        this.container = container;
    }
    
    /**
     * Shows a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Optional custom duration in milliseconds
     * @returns {HTMLElement} The toast element
     */
    show(message, type = 'info', duration = this.duration) {
        this.ensureContainer();
        
        // Manage maximum toasts
        if (this.activeToasts >= this.maxToasts) {
            const firstToast = this.container.firstChild;
            if (firstToast) {
                this.container.removeChild(firstToast);
                this.activeToasts--;
            }
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
            <div class="toast-progress"></div>
        `;
        
        // Add close functionality
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => this.close(toast));
        
        // Add to container
        this.container.appendChild(toast);
        this.activeToasts++;
        
        // Auto-dismiss after duration
        const timeout = setTimeout(() => this.close(toast), duration);
        toast._timeout = timeout;
        
        return toast;
    }
    
    /**
     * Shows a success toast notification
     * @param {string} message - Message to display
     * @param {number} duration - Optional custom duration
     * @returns {HTMLElement} The toast element
     */
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    /**
     * Shows an error toast notification
     * @param {string} message - Message to display
     * @param {number} duration - Optional custom duration
     * @returns {HTMLElement} The toast element
     */
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    /**
     * Shows a warning toast notification
     * @param {string} message - Message to display
     * @param {number} duration - Optional custom duration
     * @returns {HTMLElement} The toast element
     */
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    /**
     * Shows an info toast notification
     * @param {string} message - Message to display
     * @param {number} duration - Optional custom duration
     * @returns {HTMLElement} The toast element
     */
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
    
    /**
     * Closes a toast notification
     * @param {HTMLElement} toast - The toast element to close
     */
    close(toast) {
        // Clear the timeout to prevent duplicate close calls
        if (toast._timeout) {
            clearTimeout(toast._timeout);
            toast._timeout = null;
        }
        
        // Animate out
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        // Remove after animation
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
                this.activeToasts--;
            }
        }, 300);
    }
    
    /**
     * Closes all active toast notifications
     */
    closeAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.close(toast));
    }
}

// Create singleton instance
const toastService = new ToastService();

// Export for module use
export default toastService;

// Also add to window for global access in non-module scripts
window.toastService = toastService;