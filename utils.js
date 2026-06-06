// ============ UTILIDADES - NOTIFICAÇÕES E LOADING ============

/**
 * Exibe uma notificação Toast (estilo Android)
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);
    
    // Auto remover após duração
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Ativa o loading spinner em um botão
 * @param {HTMLElement} button - Elemento do botão
 * @param {string} originalText - Texto original (para restaurar depois)
 */
export function setButtonLoading(button, originalText = 'Enviar') {
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span>Processando...';
    button.dataset.originalText = originalText;
}

/**
 * Remove o loading spinner do botão
 * @param {HTMLElement} button - Elemento do botão
 */
export function removeButtonLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Enviar';
}

/**
 * Função auxiliar para confirmar ação crítica
 * @param {string} message - Mensagem de confirmação
 * @returns {boolean}
 */
export function confirmAction(message) {
    return confirm(message);
}

/**
 * Log melhorado para debugging
 * @param {string} action - Ação sendo realizada
 * @param {any} data - Dados a logar
 */
export function debugLog(action, data) {
    console.log(`[${new Date().toLocaleTimeString()}] ${action}:`, data);
}

export default {
    showToast,
    setButtonLoading,
    removeButtonLoading,
    confirmAction,
    debugLog
};
