document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    
    let apiKey = localStorage.getItem('openrouter_api_key');
    
    // Si ya hay una API key guardada, la cargamos
    if (apiKey) {
        apiKeyInput.value = apiKey;
        enableChat();
        addMessage('API Key cargada correctamente. ¡Ya puedes chatear con el modelo GPT-OSS-120B!', 'bot');
    }
    
    // Guardar la API key
    saveApiKeyButton.addEventListener('click', function() {
        apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('openrouter_api_key', apiKey);
            enableChat();
            addMessage('API Key guardada correctamente. ¡Ahora puedes chatear con el modelo GPT-OSS-120B!', 'bot');
        } else {
            addMessage('Por favor, ingresa una API Key válida.', 'bot', true);
        }
    });
    
    // Autoajustar altura del textarea
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Enviar mensaje al hacer clic en el botón
    sendButton.addEventListener('click', sendMessage);
    
    // Enviar mensaje al presionar Enter
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    function enableChat() {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.placeholder = 'Escribe tu mensaje aquí...';
    }
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Agregar mensaje del usuario al chat
        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Mostrar indicador de escritura
        const typingIndicator = addTypingIndicator();
        
        // Enviar mensaje al servidor Flask
        sendToFlask(message, typingIndicator);
    }
    
    function sendToFlask(message, typingIndicator) {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: message,
                api_key: apiKey
            })
        })
        .then(response => response.json())
        .then(data => {
            // Eliminar indicador de escritura
            chatMessages.removeChild(typingIndicator);
            
            if (data.error) {
                addMessage('Error: ' + data.error, 'bot', true);
            } else {
                addMessage(data.reply, 'bot');
            }
        })
        .catch(error => {
            chatMessages.removeChild(typingIndicator);
            addMessage('Error de conexión con el servidor Flask. Asegúrate de que el servidor esté ejecutándose.', 'bot', true);
            console.error('Error:', error);
        });
    }
    
    function addMessage(content, sender, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const messageContent = document.createElement('div');
        if (isError) {
            messageContent.classList.add('error-message');
        } else {
            messageContent.classList.add('message-content');
        }
        
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = content;
        
        messageContent.appendChild(messageParagraph);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addTypingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('typing-indicator');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            messageContent.appendChild(dot);
        }
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv;
    }
});