/**
 * Chatbot Mobile and Responsive Management
 */
export class ChatbotMobile {
    /**
     * Detect if the user is on a mobile or tablet device
     */
    static detectMobileDevice() {
        // Check screen width - be more inclusive for tablets
        const isMobileWidth = window.innerWidth <= 480; // Mobile phones
        const isTabletWidth = window.innerWidth <= 1024 && window.innerWidth > 480; // Tablets
        
        // Check user agent for mobile/tablet indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'mobile', 'android', 'iphone', 'ipod', 
            'blackberry', 'windows phone', 'opera mini'
        ];
        const tabletKeywords = [
            'ipad', 'tablet', 'kindle', 'silk', 'playbook'
        ];
        
        const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
        const isTabletUserAgent = tabletKeywords.some(keyword => userAgent.includes(keyword));
        
        // Check for touch support
        const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Special check for iPad which might report as desktop in some cases
        const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
        
        // Return true if any mobile/tablet indicator is present
        return isMobileWidth || 
               (isTabletWidth && (hasTouchSupport || isTabletUserAgent || isIPad)) || 
               isMobileUserAgent || 
               isTabletUserAgent || 
               isIPad;
    }

    /**
     * Adjust viewport for mobile devices when in fullscreen
     * Handles dynamic URL bars and other mobile browser UI elements
     */
    static adjustMobileViewport(chatWindow, messagesContainer, isFullscreen, isMobileDevice) {
        if (!isMobileDevice || !isFullscreen) return;
        
        // Get the visible viewport height
        const vh = window.innerHeight;
        
        // Update CSS custom property for true viewport height
        document.documentElement.style.setProperty('--chatbot-vh', `${vh}px`);
        
        // Apply the height to elements that need it
        if (chatWindow) {
            // Ensure the chat window takes up all available space
            chatWindow.style.height = `${vh}px`;
        }
        
        // Ensure messages container has proper scrolling area
        if (messagesContainer) {
            // Calculate height (viewport height minus header and input area)
            const headerHeight = chatWindow.querySelector('.chatbot-header').offsetHeight;
            const inputAreaHeight = chatWindow.querySelector('.chatbot-input-area').offsetHeight;
            const footerHeight = chatWindow.querySelector('.chatbot-footer')?.offsetHeight || 0;
            
            // Set messages container height
            messagesContainer.style.height = `${vh - headerHeight - inputAreaHeight - footerHeight}px`;
            
            // Check if virtual keyboard might be open
            const isKeyboardLikelyOpen = window.innerHeight < window.outerHeight * 0.75;
            
            // Adjust the chat UI when virtual keyboard is open
            if (isKeyboardLikelyOpen) {
                chatWindow.style.position = 'absolute';
                messagesContainer.style.maxHeight = `${vh - headerHeight - inputAreaHeight - footerHeight}px`;
                
                // Ensure input area stays in view when keyboard is open
                if (chatWindow.querySelector('.chatbot-input-area')) {
                    chatWindow.querySelector('.chatbot-input-area').style.position = 'fixed';
                    chatWindow.querySelector('.chatbot-input-area').style.bottom = '0';
                    chatWindow.querySelector('.chatbot-input-area').style.left = '0';
                    chatWindow.querySelector('.chatbot-input-area').style.right = '0';
                    chatWindow.querySelector('.chatbot-input-area').style.zIndex = '10002';
                }
            } else {
                chatWindow.style.position = 'fixed';
                
                // Reset position styles when keyboard is closed
                if (chatWindow.querySelector('.chatbot-input-area')) {
                    chatWindow.querySelector('.chatbot-input-area').style.position = 'absolute';
                }
            }
        }
    }

    /**
     * Handle input field focus (for mobile virtual keyboard)
     */
    static handleInputFocus(widget, chatWindow, inputField, messagesContainer, isFullscreen, isMobileDevice) {
        const isTabletOrMobile = isMobileDevice || (window.innerWidth <= 1024 && window.innerWidth > 480);
        if (!isTabletOrMobile || !isFullscreen) return;
        
        // Ensure input width is fixed for both mobile and tablet
        inputField.style.width = 'calc(100% - 50px)';
        inputField.style.maxWidth = 'calc(100% - 50px)';
        inputField.style.boxSizing = 'border-box';
        
        // Make sure the input area container doesn't expand
        if (chatWindow.querySelector('.chatbot-input-area')) {
            const inputArea = chatWindow.querySelector('.chatbot-input-area');
            inputArea.style.width = '100%';
            inputArea.style.boxSizing = 'border-box';
            inputArea.style.overflowX = 'hidden';
        }
        
        // Add a class to indicate the keyboard is open immediately
        widget.classList.add('keyboard-open');
        
        // Give the virtual keyboard time to open
        setTimeout(() => {
            // Recheck viewport dimensions after keyboard opens
            this.adjustMobileViewport(chatWindow, messagesContainer, isFullscreen, isMobileDevice);
            
            // Ensure text input area is visible
            if (chatWindow.querySelector('.chatbot-input-area')) {
                const inputArea = chatWindow.querySelector('.chatbot-input-area');
                inputArea.style.position = 'fixed';
                inputArea.style.bottom = '0';
                inputArea.style.left = '0';
                inputArea.style.right = '0';
                inputArea.style.zIndex = '10002';
                
                // Ensure input area has a solid background
                inputArea.style.backgroundColor = 'white';
                inputArea.style.borderTop = '1px solid #e9ecef';
                inputArea.style.boxShadow = '0 -2px 10px rgba(0, 0, 0, 0.1)';
                
                // Ensure width constraints are maintained
                inputArea.style.width = '100%';
                inputArea.style.boxSizing = 'border-box';
                inputArea.style.overflowX = 'hidden';
            }
            
            // Ensure input field width is constrained
            inputField.style.width = 'calc(100% - 50px)';
            inputField.style.maxWidth = 'calc(100% - 50px)';
            inputField.style.boxSizing = 'border-box';
            
            // Ensure scrolling area adjusts to keyboard
            if (messagesContainer) {
                // Add padding to the bottom of messages container so content isn't hidden behind input
                messagesContainer.style.paddingBottom = '80px';
            }
            
            // Scroll the input into view as a fallback
            setTimeout(() => {
                inputField.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300);
        }, 100);
    }

    /**
     * Handle input field blur (for mobile virtual keyboard)
     */
    static handleInputBlur(widget, chatWindow, messagesContainer, isFullscreen, isMobileDevice) {
        const isTabletOrMobile = isMobileDevice || (window.innerWidth <= 1024 && window.innerWidth > 480);
        if (!isTabletOrMobile || !isFullscreen) return;
        
        // Give the virtual keyboard time to close
        setTimeout(() => {
            // Remove the keyboard-open class
            widget.classList.remove('keyboard-open');
            
            // Reset the input area position and styling
            if (chatWindow.querySelector('.chatbot-input-area')) {
                const inputArea = chatWindow.querySelector('.chatbot-input-area');
                inputArea.style.position = 'absolute';
                inputArea.style.boxShadow = '';
                inputArea.style.borderTop = '';
                
                // Reset any inline styles that might have been applied
                chatWindow.style.position = 'fixed';
            }
            
            // Reset messages container padding
            if (messagesContainer) {
                messagesContainer.style.paddingBottom = '';
            }
            
            // Recalculate viewport dimensions
            this.adjustMobileViewport(chatWindow, messagesContainer, isFullscreen, isMobileDevice);
        }, 300);
    }

    /**
     * Setup mobile event listeners
     */
    static setupMobileEventListeners(widget, chatWindow, inputField, messagesContainer, isFullscreen, isMobileDevice) {
        if (!isMobileDevice) return;

        const boundAdjustViewport = () => {
            requestAnimationFrame(() => {
                this.adjustMobileViewport(chatWindow, messagesContainer, isFullscreen, isMobileDevice);
            });
        };

        const boundHandleFocus = () => {
            this.handleInputFocus(widget, chatWindow, inputField, messagesContainer, isFullscreen, isMobileDevice);
        };

        const boundHandleBlur = () => {
            this.handleInputBlur(widget, chatWindow, messagesContainer, isFullscreen, isMobileDevice);
        };

        // Handle focus/blur for mobile and tablet virtual keyboard
        const isTabletOrMobile = isMobileDevice || (window.innerWidth <= 1024 && window.innerWidth > 480);
        if (isTabletOrMobile) {
            inputField.addEventListener('focus', boundHandleFocus);
            inputField.addEventListener('blur', boundHandleBlur);
        }

        // Add resize listener for mobile viewport changes
        if (isFullscreen) {
            window.addEventListener('resize', boundAdjustViewport);
        }

        // Return cleanup function
        return () => {
            inputField.removeEventListener('focus', boundHandleFocus);
            inputField.removeEventListener('blur', boundHandleBlur);
            window.removeEventListener('resize', boundAdjustViewport);
        };
    }
} 