/**
 * Chatbot Storage Management
 */
export class ChatbotStorage {
    /**
     * Generate a unique chat ID
     * @returns {string} A unique chat identifier
     */
    static generateChatId() {
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Load existing chat ID from localStorage or generate new one
     */
    static loadOrGenerateChatId(storageKey) {
        const chatIdKey = storageKey + '-chatId';
        let chatId = localStorage.getItem(chatIdKey);
        if (!chatId) {
            chatId = this.generateChatId();
            localStorage.setItem(chatIdKey, chatId);
        }
        return chatId;
    }

    /**
     * Save chat history to local storage
     */
    static saveChatHistory(storageKey, chatId, messageHistory, persistHistory) {
        if (persistHistory && messageHistory.length > 0) {
            try {
                // Simple storage: chat ID with conversation object
                const chatData = {
                    chatId: chatId,
                    conversation: messageHistory
                };
                
                localStorage.setItem(storageKey, JSON.stringify(chatData));
            } catch (error) {
                console.warn('Failed to save chat history to localStorage:', error);
            }
        }
    }

    /**
     * Load chat history from local storage
     */
    static loadChatHistory(storageKey, persistHistory) {
        if (!persistHistory) return [];
        
        try {
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
                const chatData = JSON.parse(storedData);
                
                // Check if it's the new format with chatId and conversation
                if (chatData.chatId && chatData.conversation) {
                    return chatData.conversation;
                } else if (Array.isArray(chatData)) {
                    // Backward compatibility with old format
                    return chatData;
                }
            }
        } catch (error) {
            console.warn('Failed to load chat history from localStorage:', error);
        }
        
        return [];
    }

    /**
     * Clear chat history from storage
     */
    static clearChatHistory(storageKey, persistHistory) {
        if (persistHistory) {
            localStorage.removeItem(storageKey);
        }
    }

    /**
     * Generate new chat ID and save to storage
     */
    static generateNewChatId(storageKey) {
        const newChatId = this.generateChatId();
        const chatIdKey = storageKey + '-chatId';
        localStorage.setItem(chatIdKey, newChatId);
        return newChatId;
    }

    /**
     * Get current chat ID from storage
     */
    static getCurrentChatId(storageKey) {
        const chatIdKey = storageKey + '-chatId';
        return localStorage.getItem(chatIdKey);
    }
} 