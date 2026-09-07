/**
 * Chatbot Configuration Management
 */
export class ChatbotConfig {
    static getDefaultConfig(options = {}) {
        return {
            webhookUrl: options.webhookUrl || '',
            containerId: options.containerId || 'chatbot-widget',
            title: options.title || 'Chat with us!',
            placeholder: options.placeholder || 'Type your message...',
            primaryColor: options.primaryColor || '#007bff',
            chatBackgroundColor: options.chatBackgroundColor || '#f8f9fa',
            headerTextColor: options.headerTextColor || '#ffffff',

            // Typography - pinned so the widget never inherits the host page's fonts/colors
            fontFamily: options.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
            fontSize: options.fontSize || '14px', // Base text size, e.g. '14px' or '0.875rem'
            textColor: options.textColor || '#333333', // Default text color inside the widget

            position: options.position || 'bottom-right', // 'bottom-right', 'bottom-left', 'inline'
            welcomeMessage: options.welcomeMessage || 'Hello! How can I help you today?',
            errorMessage: options.errorMessage || 'Sorry, something went wrong. Please try again.',
            footerText: options.footerText || 'Powered By Bot',
            botIcon: options.botIcon || null, // URL to custom bot icon/image (shown on the toggle button)
            titleLogo: options.titleLogo || null, // URL to header photo/logo shown next to the title
            showLogoInChat: options.showLogoInChat ?? true, // Show avatar next to bot messages
            botAvatar: options.botAvatar || options.titleLogo || null, // URL to avatar shown next to bot reply messages (defaults to titleLogo)
            userAvatar: options.userAvatar || null, // URL to avatar shown next to sender (user) messages
            tooltipText: options.tooltipText || 'Here is your chatbot', // Tooltip text for toggle button
            maxRetries: options.maxRetries || 3,
            retryDelay: options.retryDelay || 2000,
            suggestedQuestions: options.suggestedQuestions || [], // Array of suggested questions
            maxInputLength: options.maxInputLength || 500, // Maximum input character length
            maxInputWarning: options.maxInputWarning || 'Message is too long. Please keep it under {max} characters.', // Warning message for max length
            storageKey: options.storageKey || 'chatbot-history', // Local storage key for chat history
            persistHistory: options.persistHistory ?? true, // Default to true - persist chat history

            // Drag & anchor options
            draggable: options.draggable ?? false, // Allow the widget to be dragged freely around the screen
            dragHandle: options.dragHandle || 'both', // 'toggle' | 'header' | 'both' - which element(s) can be used to drag
            snapToEdges: options.snapToEdges ?? true, // Snap the widget to the nearest screen edge (bottom, left or right) on release
            edgeMargin: options.edgeMargin ?? 20, // Distance in px kept from the screen edge when anchored
            rememberPosition: options.rememberPosition ?? true, // Persist the dragged position in localStorage between visits

            // Show/hide widget button options
            enableHideButton: options.enableHideButton ?? false, // Show a small arrow button on the toggle bubble that fully hides/shows the widget
            rememberHiddenState: options.rememberHiddenState ?? true, // Persist hidden/visible state in localStorage between visits
            ...options
        };
    }

    /**
     * Darken a hex color by a percentage
     */
    static darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    /**
     * Apply custom styling based on configuration
     */
    static applyStyling(config) {
        const root = document.documentElement;
        root.style.setProperty('--chatbot-primary-color', config.primaryColor);
        root.style.setProperty('--chatbot-chat-background', config.chatBackgroundColor);
        root.style.setProperty('--chatbot-header-text-color', config.headerTextColor);

        // Typography is set explicitly so nothing is inherited from the host page
        root.style.setProperty('--chatbot-font-family', config.fontFamily);
        root.style.setProperty('--chatbot-font-size-base', config.fontSize);
        root.style.setProperty('--chatbot-text-color', config.textColor);
        
        // Calculate darker shade for hover effects
        const darkerColor = this.darkenColor(config.primaryColor, 20);
        root.style.setProperty('--chatbot-primary-color-dark', darkerColor);
    }
} 