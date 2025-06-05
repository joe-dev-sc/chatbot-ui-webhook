/**
 * Chatbot Widget - A customizable chat widget for n8n webhooks
 * ES Module implementation for easy CDN integration
 */

import { ChatbotConfig } from './chatbot-config.js';
import { ChatbotUI } from './chatbot-ui.js';
import { ChatbotMessaging } from './chatbot-messaging.js';
import { ChatbotStorage } from './chatbot-storage.js';
import { ChatbotMobile } from './chatbot-mobile.js';

class ChatbotWidget {
    constructor(options = {}) {
        // Default configuration
        this.config = ChatbotConfig.getDefaultConfig(options);

        // State management
        this.isOpen = false;
        this.isTyping = false;
        this.isFullscreen = false;
        this.isMobileDevice = ChatbotMobile.detectMobileDevice();
        this.messageHistory = [];
        this.retryCount = 0;
        this.questionsShown = false;
        this.inputTooltip = null;
        this.toggleTooltip = null;
        this.mobileCleanupFn = null;
        
        // Load existing chat ID or generate new one
        this.chatId = ChatbotStorage.loadOrGenerateChatId(this.config.storageKey);

        // Initialize the widget
        this.init();
    }

    /**
     * Initialize the chatbot widget
     */
    init() {
        // Create container if it doesn't exist
        this.ensureContainer();
        this.createWidget();
        this.bindEvents();
        ChatbotConfig.applyStyling(this.config);
        
        // Load chat history from local storage
        this.loadChatHistory();
        
        // Show welcome message if inline mode and no history
        if (this.config.position === 'inline') {
            this.openChat();
            if (this.messageHistory.length === 0) {
                this.addMessage(this.config.welcomeMessage, 'bot');
            }
            // Show suggested questions for inline mode if available and no history
            this._showSuggestedQuestionsIfApplicable();
        }
    }

    /**
     * Private method to show suggested questions when applicable
     */
    _showSuggestedQuestionsIfApplicable() {
        if (this.config.suggestedQuestions.length > 0 && this.messageHistory.length === 0) {
            this.showSuggestedQuestions();
        }
    }

    /**
     * Private method to handle input width constraints on mobile/tablet
     */
    _constrainInputWidth() {
        const isTabletOrMobile = this.isMobileDevice || (window.innerWidth <= 1024 && window.innerWidth > 480);
        if (isTabletOrMobile) {
            this.inputField.style.width = 'calc(100% - 50px)';
            this.inputField.style.maxWidth = 'calc(100% - 50px)';
            this.inputField.style.boxSizing = 'border-box';
        }
    }

    /**
     * Private method to handle automatic fullscreen entry on mobile
     */
    _handleMobileFullscreenEntry() {
        if (this.isMobileDevice && this.config.position !== 'inline' && !this.isFullscreen) {
            setTimeout(() => {
                this.enterFullscreen();
            }, 100);
        }
    }

    /**
     * Private method to handle focus delay with proper timing
     */
    _focusInputWithDelay() {
        setTimeout(() => {
            this.inputField.focus();
        }, 300);
    }

    /**
     * Private method to handle scroll delay after UI transitions
     */
    _scrollToBottomWithDelay() {
        setTimeout(() => {
            this.scrollToBottom();
        }, 300);
    }

    /**
     * Ensure the container exists, create if necessary
     */
    ensureContainer() {
        ChatbotUI.ensureContainer(this.config.containerId);
    }

    /**
     * Create the widget HTML structure
     */
    createWidget() {
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error(`Chatbot Widget: Container with ID "${this.config.containerId}" not found`);
            return;
        }

        container.innerHTML = ChatbotUI.createWidget(this.config, this.isMobileDevice);

        // Store references to key elements
        this.widget = container.querySelector('.chatbot-widget');
        this.toggleButton = container.querySelector('.chatbot-toggle');
        this.chatWindow = container.querySelector('.chatbot-window');
        this.messagesContainer = container.querySelector('.chatbot-messages');
        this.suggestedQuestionsContainer = container.querySelector('.chatbot-suggested-questions');
        this.inputField = container.querySelector('.chatbot-input');
        this.sendButton = container.querySelector('.chatbot-send');
        this.minimizeButton = container.querySelector('.chatbot-minimize');
        this.refreshButton = container.querySelector('.chatbot-refresh');
        this.fullscreenButton = container.querySelector('.chatbot-fullscreen');
        this.inputTooltip = container.querySelector('.chatbot-input-tooltip');
        this.toggleTooltip = container.querySelector('.chatbot-toggle-tooltip');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle button click
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleChat());
            
            // Tooltip events
            this.toggleButton.addEventListener('mouseenter', () => this.showToggleTooltip());
            this.toggleButton.addEventListener('mouseleave', () => this.hideToggleTooltip());
        }

        // Minimize button click
        if (this.minimizeButton) {
            this.minimizeButton.addEventListener('click', () => this.closeChat());
        }

        // Refresh button click
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => this.clearChatHistory());
        }

        // Fullscreen button click (only if not mobile)
        if (this.fullscreenButton && !this.isMobileDevice) {
            this.fullscreenButton.addEventListener('click', () => this.toggleFullscreen());
        }

        // Send button click
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Input field events
        if (this.inputField) {
            this.inputField.addEventListener('input', () => this.handleInputChange());
            this.inputField.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        // Suggested questions click events
        if (this.suggestedQuestionsContainer) {
            this.suggestedQuestionsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('chatbot-suggested-question')) {
                    this.handleSuggestedQuestionClick(e.target);
                }
            });
        }

        // Close chat when clicking outside (for non-inline mode and non-mobile)
        if (this.config.position !== 'inline' && !this.isMobileDevice) {
            document.addEventListener('click', (e) => this.handleOutsideClick(e));
        }

        // Handle escape key to exit fullscreen (only for non-mobile)
        if (!this.isMobileDevice) {
            document.addEventListener('keydown', (e) => this.handleEscapeKey(e));
        }
    }

    /**
     * Handle input field changes
     */
    handleInputChange() {
        const value = this.inputField.value.trim();
        const currentLength = this.inputField.value.length;
        const isOverLimit = currentLength > this.config.maxInputLength;
        
        // Disable send button if no value or over character limit
        this.sendButton.disabled = !value || isOverLimit;
        
        // Show/hide tooltip based on character limit
        if (isOverLimit) {
            this.showInputTooltip();
        } else {
            this.hideInputTooltip();
        }
        
        // Auto-resize textarea height only, never width
        this.inputField.style.height = 'auto';
        this.inputField.style.overflow = 'hidden';
        const newHeight = Math.min(this.inputField.scrollHeight, 100);
        this.inputField.style.height = newHeight + 'px';
        
        // Ensure overflow stays hidden to prevent scrollbars
        if (newHeight >= 100) {
            this.inputField.style.overflowY = 'hidden';
        }
        
        // Ensure width remains fixed for both mobile and tablet devices
        this._constrainInputWidth();
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Handle suggested question clicks
     */
    handleSuggestedQuestionClick(questionElement) {
        const question = questionElement.getAttribute('data-question');
        if (question) {
            // Fill the input field with the selected question
            this.inputField.value = question;
            this.handleInputChange();
            
            // Hide suggested questions after selection
            this.hideSuggestedQuestions();
            
            // Auto-send the message
            this.sendMessage();
        }
    }

    /**
     * Handle clicks outside the widget
     */
    handleOutsideClick(e) {
        if (this.isOpen && !this.widget.contains(e.target)) {
            this.closeChat();
        }
    }

    /**
     * Handle escape key press (disabled on mobile)
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isFullscreen && !this.isMobileDevice) {
            this.toggleFullscreen();
        }
    }

    /**
     * Toggle chat window open/closed
     */
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    /**
     * Open chat window
     */
    openChat() {
        this.isOpen = true;
        this.chatWindow.classList.add('open');
        
        // Hide tooltip when chat opens
        this.hideToggleTooltip();
        
        if (this.toggleButton) {
            this.toggleButton.classList.add('active');
            this.toggleButton.setAttribute('aria-label', 'Close chat');
        }
        
        // Automatically enter fullscreen mode on mobile devices
        this._handleMobileFullscreenEntry();
        
        // Load and display chat history
        this.displayChatHistory();
        
        // Show suggested questions if available and no messages have been sent yet
        this._showSuggestedQuestionsIfApplicable();
        
        // Focus input field
        this._focusInputWithDelay();
    }

    /**
     * Close chat window
     */
    closeChat() {
        // If in fullscreen, exit fullscreen when closing
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        this.isOpen = false;
        this.chatWindow.classList.remove('open');
        
        if (this.toggleButton) {
            this.toggleButton.classList.remove('active');
            this.toggleButton.setAttribute('aria-label', 'Open chat');
        }
    }

    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
        this.isFullscreen = true;
        this.widget.classList.add('fullscreen');
        
        if (this.fullscreenButton) {
            this.fullscreenButton.classList.add('active');
            this.fullscreenButton.setAttribute('aria-label', 'Exit fullscreen');
        }
        
        // Ensure chat is open when entering fullscreen
        if (!this.isOpen) {
            this.openChat();
        }
        
        // Mobile-specific adjustments
        if (this.isMobileDevice) {
            // Force body to be fixed to prevent scrolling behind the chat
            document.body.style.overflow = 'hidden';
            
            // Setup mobile event listeners
            this.mobileCleanupFn = ChatbotMobile.setupMobileEventListeners(
                this.widget, this.chatWindow, this.inputField, this.messagesContainer, 
                this.isFullscreen, this.isMobileDevice
            );
            
            // Initial adjustment for viewport height
            ChatbotMobile.adjustMobileViewport(this.chatWindow, this.messagesContainer, this.isFullscreen, this.isMobileDevice);
        }
        
        // Scroll to bottom after transition
        this._scrollToBottomWithDelay();
    }

    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
        this.isFullscreen = false;
        this.widget.classList.remove('fullscreen');
        
        if (this.fullscreenButton) {
            this.fullscreenButton.classList.remove('active');
            this.fullscreenButton.setAttribute('aria-label', 'Enter fullscreen');
        }
        
        // Mobile-specific cleanup
        if (this.isMobileDevice) {
            // Restore body scrolling
            document.body.style.overflow = '';
            
            // Clean up mobile event listeners
            if (this.mobileCleanupFn) {
                this.mobileCleanupFn();
                this.mobileCleanupFn = null;
            }
        }
        
        // Scroll to bottom after transition
        this._scrollToBottomWithDelay();
    }

    /**
     * Toggle fullscreen mode (disabled on mobile devices)
     */
    toggleFullscreen() {
        // Prevent fullscreen toggle on mobile devices
        if (this.isMobileDevice) {
            return;
        }
        
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    /**
     * Show/hide suggested questions
     */
    showSuggestedQuestions() {
        ChatbotUI.showSuggestedQuestions(this.suggestedQuestionsContainer);
        this.questionsShown = true;
    }

    hideSuggestedQuestions() {
        ChatbotUI.hideSuggestedQuestions(this.suggestedQuestionsContainer);
        this.questionsShown = false;
    }

    /**
     * Show/hide tooltips
     */
    showToggleTooltip() {
        if (!this.isOpen) {
            ChatbotUI.showTooltip(this.toggleTooltip);
        }
    }

    hideToggleTooltip() {
        ChatbotUI.hideTooltip(this.toggleTooltip);
    }

    /**
     * Show/hide input validation tooltip
     */
    showInputTooltip() {
        const currentLength = this.inputField.value.length;
        const warningMessage = this.config.maxInputWarning.replace('{max}', this.config.maxInputLength);
        ChatbotUI.showInputTooltip(this.inputTooltip, currentLength, this.config.maxInputLength, warningMessage);
    }

    hideInputTooltip() {
        ChatbotUI.hideInputTooltip(this.inputTooltip);
    }

    /**
     * Send a message
     */
    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message || this.isTyping) return;

        // Validate message length before sending
        if (this.inputField.value.length > this.config.maxInputLength) {
            this.showInputTooltip();
            return;
        }

        // Add user message to chat
        this.addMessage(message, 'user');
        this.inputField.value = '';
        this.handleInputChange();

        // Show typing indicator
        this.showTyping();

        // Reset retry count for new message
        this.retryCount = 0;
        
        // Start the send attempt with retry logic
        await this.sendWithRetry(message);
    }

    /**
     * Send message with retry logic
     */
    async sendWithRetry(message) {
        try {
            // Send message to n8n webhook
            const response = await ChatbotMessaging.sendToWebhook(this.config.webhookUrl, message, this.chatId);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add bot response - check for both 'output' and 'message' fields
            if (response && (response.output || response.message)) {
                this.addMessage(response.output || response.message, 'bot');
            } else {
                this.addMessage('I received your message, thank you!', 'bot');
            }
            
            this.retryCount = 0; // Reset retry count on success
            
        } catch (error) {
            console.error('Chatbot error:', error);
            
            // Handle retry logic
            if (this.retryCount < this.config.maxRetries) {
                this.retryCount++;
                
                // Only show retry message if this is not the first attempt
                if (this.retryCount > 1) {
                    this.addMessage(`Connection issue. Retrying... (${this.retryCount - 1}/${this.config.maxRetries})`, 'bot');
                }
                
                // Wait before retrying
                setTimeout(() => {
                    this.sendWithRetry(message);
                }, this.config.retryDelay);
            } else {
                // All retries exhausted, hide typing and show error
                this.hideTyping();
                this.addMessage(this.config.errorMessage, 'chatbot-error');
                this.retryCount = 0;
            }
        }
    }

    /**
     * Add a message to the chat
     */
    addMessage(text, type = 'bot') {
        const messageElement = ChatbotMessaging.createMessageElement(text, type, this.config);

        // Remove welcome message if it exists
        const welcomeMessage = this.messagesContainer.querySelector('.chatbot-welcome');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // Hide suggested questions after first user message
        if (type === 'user' && this.questionsShown) {
            this.hideSuggestedQuestions();
        }

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Store in message history
        this.messageHistory.push({
            text: text,
            type: type,
            timestamp: new Date().toISOString()
        });

        // Save to local storage if persistence is enabled
        if (this.config.persistHistory) {
            this.saveChatHistory();
        }
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        this.isTyping = true;
        
        // Remove any existing typing indicator
        const existingTyping = this.messagesContainer.querySelector('.chatbot-typing');
        if (existingTyping) {
            existingTyping.remove();
        }
        
        // Create new typing indicator
        const typingElement = ChatbotMessaging.createTypingIndicator();
        
        // Append to the bottom of messages
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        this.isTyping = false;
        const typingElement = this.messagesContainer.querySelector('.chatbot-typing');
        if (typingElement) {
            typingElement.remove();
        }
    }

    /**
     * Scroll messages to bottom
     */
    scrollToBottom(forceImmediate = false) {
        ChatbotMessaging.scrollToBottom(this.messagesContainer, this.isFullscreen, this.isMobileDevice, forceImmediate);
    }

    /**
     * Clear chat history
     */
    clearChat() {
        this.messagesContainer.innerHTML = `<div class="chatbot-welcome">${this.config.welcomeMessage}</div>`;
        this.messageHistory = [];
        
        // Clear from local storage if persistence is enabled
        ChatbotStorage.clearChatHistory(this.config.storageKey, this.config.persistHistory);
    }

    /**
     * Clear chat history (public method for refresh button)
     */
    clearChatHistory() {
        this.clearChat();
        
        // Generate new chat ID when refresh button is clicked
        this.chatId = ChatbotStorage.generateNewChatId(this.config.storageKey);
        
        // Show suggested questions again after clearing
        if (this.config.suggestedQuestions.length > 0) {
            this.showSuggestedQuestions();
        }
    }

    /**
     * Get current chat ID
     */
    getCurrentChatId() {
        return this.chatId;
    }

    /**
     * Save chat history to local storage
     */
    saveChatHistory() {
        ChatbotStorage.saveChatHistory(this.config.storageKey, this.chatId, this.messageHistory, this.config.persistHistory);
    }

    /**
     * Get chat history
     */
    getChatHistory() {
        return this.messageHistory;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        ChatbotConfig.applyStyling(this.config);
        
        // Update title if changed
        const titleElement = this.widget.querySelector('.chatbot-title');
        if (titleElement) {
            titleElement.textContent = this.config.title;
        }
        
        // Update placeholder if changed
        if (this.inputField) {
            this.inputField.placeholder = this.config.placeholder;
        }
    }

    /**
     * Destroy the widget
     */
    destroy() {
        const container = document.getElementById(this.config.containerId);
        if (container) {
            container.innerHTML = '';
        }
        
        // Remove event listeners
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapeKey);
        
        // Clean up mobile listeners if they exist
        if (this.mobileCleanupFn) {
            this.mobileCleanupFn();
        }
    }

    /**
     * Load chat history from local storage
     */
    loadChatHistory() {
        this.messageHistory = ChatbotStorage.loadChatHistory(this.config.storageKey, this.config.persistHistory);
        
        if (this.messageHistory.length > 0) {
            this.displayChatHistory();
            
            // If we have history, don't show welcome message
            const welcomeMessage = this.messagesContainer.querySelector('.chatbot-welcome');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
            return;
        }
        
        // No stored history found, show welcome message if not inline mode
        if (this.config.position !== 'inline') {
            this.messagesContainer.innerHTML = `<div class="chatbot-welcome">${this.config.welcomeMessage}</div>`;
        }
    }

    /**
     * Display chat history
     */
    displayChatHistory() {
        // Clear messages container first
        this.messagesContainer.innerHTML = '';
        
        // Display each message from history without adding to history again
        this.messageHistory.forEach((message) => {
            const messageElement = ChatbotMessaging.createMessageElement(message.text, message.type, this.config);
            this.messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', function() {
    const autoInitElements = document.querySelectorAll('[data-chatbot-auto-init]');
    
    autoInitElements.forEach(element => {
        const config = {
            containerId: element.id,
            webhookUrl: element.dataset.webhookUrl,
            title: element.dataset.title,
            placeholder: element.dataset.placeholder,
            primaryColor: element.dataset.primaryColor,
            position: element.dataset.position,
            welcomeMessage: element.dataset.welcomeMessage
        };
        
        // Remove undefined values
        Object.keys(config).forEach(key => {
            if (config[key] === undefined) {
                delete config[key];
            }
        });
        
        new ChatbotWidget(config);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotWidget;
}

/**
 * Create and initialize a chatbot widget
 * @param {Object} options - Configuration options for the chatbot
 * @returns {ChatbotWidget} - The chatbot widget instance
 */
export function createChat(options = {}) {
    return new ChatbotWidget(options);
}

// Default export
export default ChatbotWidget; 