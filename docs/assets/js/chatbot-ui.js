/**
 * Chatbot UI Management
 */
export class ChatbotUI {
    /**
     * Create toggle button HTML
     */
    static createToggleButton(config) {
        const iconContent = config.botIcon 
            ? `<img src="${config.botIcon}" alt="Chat" class="chatbot-icon-image" />
               <svg class="close-icon" viewBox="0 0 24 24">
                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
               </svg>`
            : `<svg class="chat-icon" viewBox="0 0 24 24">
                   <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
               </svg>
               <svg class="close-icon" viewBox="0 0 24 24">
                   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
               </svg>`;

        return `
            <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chat">
                ${iconContent}
            </button>
        `;
    }

    /**
     * Create tooltip HTML
     */
    static createTooltip(config) {
        return `
            <div class="chatbot-toggle-tooltip" id="chatbot-toggle-tooltip">
                ${config.tooltipText}
            </div>
        `;
    }

    /**
     * Create minimize button HTML
     */
    static createMinimizeButton() {
        return `
            <button class="chatbot-minimize" id="chatbot-minimize" aria-label="Minimize chat">
                <svg viewBox="0 0 24 24">
                    <path d="M19 13H5v-2h14v2z"/>
                </svg>
            </button>
        `;
    }

    /**
     * Create refresh button HTML
     */
    static createRefreshButton() {
        return `
            <button class="chatbot-refresh" id="chatbot-refresh" aria-label="Clear chat history">
                <svg viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
        `;
    }

    /**
     * Create fullscreen button HTML
     */
    static createFullscreenButton(isMobileDevice, config) {
        // Don't show fullscreen button on mobile devices or inline mode
        if (isMobileDevice || config.position === 'inline') {
            return '';
        }
        
        return `
            <button class="chatbot-fullscreen" id="chatbot-fullscreen" aria-label="Toggle fullscreen">
                <svg class="expand-icon" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
                <svg class="compress-icon" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
            </button>
        `;
    }

    /**
     * Create send icon HTML
     */
    static createSendIcon() {
        return `
            <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
        `;
    }

    /**
     * Create suggested questions HTML
     */
    static createSuggestedQuestions(config) {
        if (!config.suggestedQuestions || config.suggestedQuestions.length === 0) {
            return '';
        }

        const questionsHTML = config.suggestedQuestions.map((question, index) => 
            `<button class="chatbot-suggested-question" data-question="${question}" data-index="${index}">
                ${question}
            </button>`
        ).join('');

        return questionsHTML;
    }

    /**
     * Create the complete widget HTML structure
     */
    static createWidget(config, isMobileDevice) {
        return `
            <div class="chatbot-widget ${config.position}">
                ${config.position !== 'inline' ? this.createToggleButton(config) : ''}
                <div class="chatbot-window ${config.position === 'inline' ? 'open' : ''}">
                    <div class="chatbot-header">
                        ${config.titleLogo ? `<img src="${config.titleLogo}" alt="Logo" class="chatbot-title-logo" />` : ''}
                        <h3 class="chatbot-title">${config.title}</h3>
                        <div class="chatbot-header-buttons">
                            ${this.createRefreshButton()}
                            ${this.createFullscreenButton(isMobileDevice, config)}
                            ${config.position !== 'inline' ? this.createMinimizeButton() : ''}
                        </div>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        ${config.position !== 'inline' ? `<div class="chatbot-welcome">${config.welcomeMessage}</div>` : ''}
                    </div>
                    <div class="chatbot-suggested-questions" id="chatbot-suggested-questions">
                        ${this.createSuggestedQuestions(config)}
                    </div>
                    <div class="chatbot-input-area">
                        <textarea 
                            class="chatbot-input" 
                            placeholder="${config.placeholder}"
                            rows="1"
                            id="chatbot-input"
                        ></textarea>
                        <button class="chatbot-send" id="chatbot-send" disabled>
                            ${this.createSendIcon()}
                        </button>
                        <div class="chatbot-input-tooltip" id="chatbot-input-tooltip" style="display: none;"></div>
                    </div>
                    <div class="chatbot-footer">
                        <span class="chatbot-footer-text">${config.footerText}</span>
                    </div>
                </div>
                ${config.position !== 'inline' ? this.createTooltip(config) : ''}
            </div>
        `;
    }

    /**
     * Ensure the container exists, create if necessary
     */
    static ensureContainer(containerId) {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Show/hide suggested questions
     */
    static showSuggestedQuestions(container) {
        if (container) {
            container.style.display = 'block';
        }
    }

    static hideSuggestedQuestions(container) {
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * Show/hide tooltips
     */
    static showTooltip(tooltip) {
        if (tooltip) {
            tooltip.classList.add('show');
        }
    }

    static hideTooltip(tooltip) {
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    /**
     * Show/hide input validation tooltip
     */
    static showInputTooltip(tooltip, currentLength, maxLength, warningMessage) {
        if (tooltip) {
            const characterInfo = `${currentLength}/${maxLength} characters`;
            
            tooltip.innerHTML = `
                <div class="chatbot-tooltip-content">
                    <div class="chatbot-tooltip-warning">${warningMessage}</div>
                    <div class="chatbot-tooltip-counter">${characterInfo}</div>
                </div>
            `;
            tooltip.style.display = 'block';
        }
    }

    static hideInputTooltip(tooltip) {
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
} 