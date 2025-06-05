# Chatbot Widget

A lightweight, customizable chat widget for integrating with webhooks. This widget is built with vanilla JavaScript as an ES module and can be easily added to any website.

## Features

- Clean, modern UI with customizable styling
- Mobile responsive design with automatic fullscreen on mobile devices
- Suggested questions to guide user interactions
- Error handling with automatic retry logic
- Persistent chat history using localStorage
- Fullscreen mode for desktop users
- Customizable branding with logo support

## Usage

See the [demo page](example.html) for full documentation and live examples.

### Quick Start

```html
<link href="https://yourdomain.com/path/to/chatbot-widget.css" rel="stylesheet">
<script type="module">
    import ChatbotWidget from 'https://yourdomain.com/path/to/chatbot-widget.js';
    
    document.addEventListener('DOMContentLoaded', function() {
        const chatbot = new ChatbotWidget({
            webhookUrl: 'YOUR_WEBHOOK_URL',
            title: 'Support Chat',
            primaryColor: '#007bff',
            // Add other configuration options as needed
        });
    });
</script>
```

Replace the URLs with your actual hosting paths and `YOUR_WEBHOOK_URL` with your webhook endpoint.

## Documentation

For complete documentation and configuration options, visit the [demo page](example.html). 