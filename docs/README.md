# Chatbot Widget - GitHub Pages CDN

This chatbot widget is hosted on GitHub Pages and can be used as a CDN for easy integration.

## CDN Usage

### Basic Integration

Add these lines to your HTML:

```html
<!-- CSS -->
<link href="https://yourusername.github.io/your-repo-name/assets/css/chatbot-widget.css" rel="stylesheet">

<!-- JavaScript (ES Module) -->
<script type="module">
    import ChatbotWidget from 'https://yourusername.github.io/your-repo-name/assets/js/chatbot-widget.js';
    
    const chatbot = new ChatbotWidget({
        webhookUrl: 'YOUR_WEBHOOK_URL',
        title: 'Support Chat',
        primaryColor: '#007bff',
        position: 'bottom-right'
    });
</script>
```

### Alternative: Script Tag Integration

For non-module environments:

```html
<!-- CSS -->
<link href="https://yourusername.github.io/your-repo-name/assets/css/chatbot-widget.css" rel="stylesheet">

<!-- JavaScript -->
<script src="https://yourusername.github.io/your-repo-name/assets/js/chatbot-widget.js"></script>
<script>
    const chatbot = new ChatbotWidget({
        webhookUrl: 'YOUR_WEBHOOK_URL',
        title: 'Support Chat'
    });
</script>
```

## Demo

Visit the live site: https://joe-dev-sc.github.io/chatbot-ui-webhook

## Features

- ✅ Pure static files (HTML, CSS, JS)
- ✅ No build process required
- ✅ CDN-ready for easy integration
- ✅ Mobile responsive
- ✅ Modular architecture
- ✅ ES6 modules support
- ✅ Customizable styling
- ✅ Chat history persistence
- ✅ Fullscreen mode
- ✅ Suggested questions
- ✅ Accessibility features

## Configuration Options

```javascript
{
    webhookUrl: 'YOUR_WEBHOOK_URL',            // Required
    title: 'Support Chat',                     // Optional
    placeholder: 'Ask me anything...',         // Optional
    primaryColor: '#e91e63',                   // Optional
    chatBackgroundColor: '#fdf2f8',            // Optional
    position: 'bottom-right',                  // Optional: 'bottom-right', 'bottom-left', 'inline'
    welcomeMessage: 'Hi! How can I help?',     // Optional
    botIcon: 'URL_TO_ICON',                    // Optional
    titleLogo: 'URL_TO_LOGO',                  // Optional
    suggestedQuestions: [...],                 // Optional
    persistHistory: true,                      // Optional
    maxInputLength: 500                        // Optional
}
``` 