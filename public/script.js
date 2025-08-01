document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    const sendButton = chatForm.querySelector('button');

    const addMessageToChat = (message, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = message;
        chatHistory.prepend(messageDiv);
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToChat(userMessage, 'user');
        userInput.value = '';
        sendButton.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage })
            });

            const data = await response.json();
            
            if (response.ok) {
                addMessageToChat(data.response, 'bot');
            } else {
                addMessageToChat('متأسفانه خطایی رخ داد.', 'bot');
                console.error('Error from Netlify Function:', data);
            }
        } catch (error) {
            console.error('Network or API error:', error);
            addMessageToChat('متأسفانه خطایی در ارتباط رخ داد.', 'bot');
        } finally {
            sendButton.disabled = false;
        }
    });
});
