/**
 * Chatbot Messaging Management
 */
export class ChatbotMessaging {
    /**
     * Send message to n8n webhook
     */
    static async sendToWebhook(webhookUrl, message, chatId) {
        if (!webhookUrl) {
            throw new Error('Webhook URL not configured');
        }

        // Include chat ID in the payload for session tracking
        const payload = {
            message: message,
            chatId: chatId
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    }

    /**
     * Format message text to handle special characters and make them visually pleasing
     * @param {string} text - Raw text from API response
     * @returns {HTMLElement} - Formatted HTML element
     */
    static formatMessageText(text) {
        if (!text) return document.createTextNode('');

        // Convert string to string if it's not already
        const textStr = String(text);
        
        // Create a container element
        const container = document.createElement('div');
        container.className = 'chatbot-message-content';
        
        // Handle different formatting characters
        const lines = textStr.split(/\\n|\n/); // Split on both \n and actual newlines
        
        lines.forEach((line, index) => {
            // Handle tabs and other special characters within each line
            const formattedLine = line
                .replace(/\\t/g, '    ') // Replace \t with 4 spaces
                .replace(/\\r/g, '') // Remove \r characters
                .replace(/\\\\/g, '\\') // Replace \\ with single \
                .replace(/\\"/g, '"') // Replace \" with "
                .replace(/\\'/g, "'"); // Replace \' with '
            
            // Create text node for the line
            if (formattedLine.trim() || lines.length === 1) {
                const textNode = document.createTextNode(formattedLine);
                container.appendChild(textNode);
            }
            
            // Add line break if not the last line
            if (index < lines.length - 1) {
                container.appendChild(document.createElement('br'));
            }
        });
        
        return container;
    }

    /**
     * Create a message element
     */
    static createMessageElement(text, type, config) {
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${type}`;
        
        // For bot messages, add logo if enabled and available
        if ((type === 'bot' || type === 'chatbot-error') && config.showLogoInChat && config.titleLogo) {
            const messageWithLogo = document.createElement('div');
            messageWithLogo.className = 'chatbot-message-with-logo';
            
            const logoElement = document.createElement('img');
            logoElement.src = config.titleLogo;
            logoElement.alt = 'Bot';
            logoElement.className = 'chatbot-message-logo';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'chatbot-message-content-wrapper';
            
            // Use formatted text for bot messages
            if (type === 'bot' || type === 'chatbot-error') {
                const formattedContent = this.formatMessageText(text);
                messageContent.appendChild(formattedContent);
            } else {
                messageContent.textContent = text;
            }
            
            messageWithLogo.appendChild(logoElement);
            messageWithLogo.appendChild(messageContent);
            messageElement.appendChild(messageWithLogo);
        } else {
            // Use formatted text for bot messages, plain text for user messages
            if (type === 'bot' || type === 'chatbot-error') {
                const formattedContent = this.formatMessageText(text);
                messageElement.appendChild(formattedContent);
            } else {
                messageElement.textContent = text;
            }
        }

        return messageElement;
    }

    /**
     * Create typing indicator element
     */
    static createTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'chatbot-typing show';
        typingElement.innerHTML = `
            <div class="chatbot-typing-dots">
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
                <div class="chatbot-typing-dot"></div>
            </div>
        `;
        return typingElement;
    }

    /**
     * Scroll messages to bottom
     */
    static scrollToBottom(messagesContainer, isFullscreen = false, isMobileDevice = false, forceImmediate = false) {
        const scrollFunc = () => {
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Extra handling for mobile devices with virtual keyboard open
                if (isMobileDevice && isFullscreen && document.querySelector('.chatbot-widget.fullscreen .keyboard-open')) {
                    // Ensure the most recent message is visible when keyboard is open
                    const lastMessage = messagesContainer.lastElementChild;
                    if (lastMessage) {
                        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                }
            }
        };
        
        if (forceImmediate) {
            scrollFunc();
        } else {
            // Small delay to ensure DOM is updated
            setTimeout(scrollFunc, 100);
        }
    }
} 