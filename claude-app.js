// Claude UI Replica - Main JavaScript File
// Author: JATIN (Python Developer)
// A fully functional chat interface with demo AI responses

// Global variables
let userName = '';
let userInterests = '';
let userRole = 'AI Assistant User';
let apiKey = '';
let currentChatId = null;
let chatHistory = [];
let chatMessages = {}; // Store actual messages for each chat
let isTyping = false;
let isUsingRealAPI = false;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Claude UI...');
    checkExistingSetup();
    setupEventListeners();
    console.log('Claude UI initialization complete');
});

// Check if user has already completed setup
function checkExistingSetup() {
    const savedName = localStorage.getItem('userName');
    const savedApiKey = localStorage.getItem('apiKey');
    const savedInterests = localStorage.getItem('userInterests');
    const savedRole = localStorage.getItem('userRole');
    
    if (savedName) {
        userName = savedName;
        userInterests = savedInterests || '';
        userRole = savedRole || 'AI Assistant User';
        apiKey = savedApiKey || '';
        isUsingRealAPI = !!(savedApiKey && savedApiKey.length > 10);
        console.log('Existing setup found for:', userName, 'API Mode:', isUsingRealAPI ? 'Real' : 'Demo');
        showApp();
    } else {
        showSetupScreen();
    }
}

// Show the setup screen
function showSetupScreen() {
    const setupScreen = document.getElementById('setupScreen');
    const app = document.getElementById('app');
    
    if (setupScreen && app) {
        setupScreen.classList.remove('hidden');
        app.classList.remove('visible');
        console.log('Setup screen displayed');
    }
}

// Handle setup form submission
async function handleSetup(e) {
    e.preventDefault();
    console.log('Setup form submitted');
    
    const nameInput = document.getElementById('userName');
    const keyInput = document.getElementById('apiKey');
    const interestsInput = document.getElementById('userInterests');
    const nameError = document.getElementById('nameError');
    const apiError = document.getElementById('apiError');
    const submitBtn = document.getElementById('setupBtn');
    const btnText = document.getElementById('btnText');
    const demoInfo = document.getElementById('demoInfo');
    
    // Reset errors
    nameError.style.display = 'none';
    apiError.style.display = 'none';
    demoInfo.style.display = 'none';
    
    const name = nameInput.value.trim();
    const key = keyInput.value.trim();
    const interests = interestsInput.value.trim();
    
    console.log('Setup data - Name:', name, 'API Key length:', key.length, 'Interests:', interests.substring(0, 50));
    
    // Validate name (required)
    if (!name || name.length < 2) {
        nameError.style.display = 'block';
        nameInput.focus();
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    btnText.textContent = 'Setting up...';
    
    try {
        // Set user data
        userName = name;
        userInterests = interests;
        
        // Determine user role based on interests
        if (interests.toLowerCase().includes('python')) {
            userRole = 'Python Developer';
        } else if (interests.toLowerCase().includes('javascript') || interests.toLowerCase().includes('web')) {
            userRole = 'Web Developer';
        } else if (interests.toLowerCase().includes('cybersecurity') || interests.toLowerCase().includes('security')) {
            userRole = 'Security Specialist';
        } else if (interests.toLowerCase().includes('data') || interests.toLowerCase().includes('analysis')) {
            userRole = 'Data Analyst';
        } else if (interests.toLowerCase().includes('machine learning') || interests.toLowerCase().includes('ai')) {
            userRole = 'ML Engineer';
        } else if (interests) {
            userRole = 'Developer';
        } else {
            userRole = 'AI Assistant User';
        }
        
        // Handle API key (optional)
        if (key && key.length > 10) {
            btnText.textContent = 'Validating API key...';
            
            // Test API key with Gemini 2.5 Flash
            const isValidKey = await testGeminiAPIKey(key);
            
            if (isValidKey) {
                apiKey = key;
                isUsingRealAPI = true;
                console.log('Valid API key provided - using real Gemini responses');
            } else {
                // Show error but allow demo mode
                apiError.textContent = 'API key validation failed. Continuing in demo mode.';
                apiError.style.display = 'block';
                apiKey = '';
                isUsingRealAPI = false;
                demoInfo.style.display = 'block';
                
                // Wait a moment to show the message
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } else {
            // No API key provided - use demo mode
            apiKey = '';
            isUsingRealAPI = false;
            demoInfo.style.display = 'block';
            console.log('No API key provided - using demo mode');
        }
        
        // Save to localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userInterests', userInterests);
        localStorage.setItem('userRole', userRole);
        if (apiKey) {
            localStorage.setItem('apiKey', apiKey);
        }
        localStorage.setItem('isUsingRealAPI', isUsingRealAPI.toString());
        
        btnText.textContent = 'Welcome! Entering AI workspace...';
        
        // Show app after brief delay
        setTimeout(() => {
            showApp();
        }, 1500);
        
    } catch (error) {
        console.error('Setup error:', error);
        apiError.textContent = 'Setup failed. Please try again.';
        apiError.style.display = 'block';
        
        submitBtn.disabled = false;
        btnText.textContent = 'Start Your AI Experience';
    }
}

// Test Gemini API key
async function testGeminiAPIKey(key) {
    console.log('Testing Gemini API key...');
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Hello! This is a test message to validate the API key."
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 20
                }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('API key validation successful');
            return true;
        } else {
            console.warn('API key validation failed - status:', response.status);
            return false;
        }
    } catch (error) {
        console.warn('API key validation error:', error);
        // If there's a network error, still allow demo mode
        return false;
    }
}

// Show the main app
function showApp() {
    const setupScreen = document.getElementById('setupScreen');
    const app = document.getElementById('app');
    
    if (setupScreen && app) {
        setupScreen.classList.add('hidden');
        app.classList.add('visible');
        
        // Initialize app
        initializeApp();
        
        console.log('App displayed for user:', userName, 'API Mode:', isUsingRealAPI ? 'Real' : 'Demo');
    }
}

// Initialize the application
function initializeApp() {
    console.log('initializeApp() called');
    updateGreeting();
    
    // Load chat history first
    loadChatHistory();
    
    // Force update the chat history display to ensure it shows
    setTimeout(() => {
        updateChatHistoryDisplay();
        console.log('Chat history display updated, total chats:', chatHistory.length);
    }, 100);
    
    // Only create demo chats if user specifically wants them (removed auto-creation)
    // Chat history will start empty for a clean experience
    
    // Update user display
    updateUserDisplay();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    console.log('App initialized with user:', userName, 'API Mode:', isUsingRealAPI ? 'Real' : 'Demo');
}

// Update user display in sidebar
function updateUserDisplay() {
    const userAvatar = document.getElementById('userAvatar');
    const displayName = document.getElementById('displayName');
    
    if (userAvatar && displayName) {
        userAvatar.textContent = userName.charAt(0).toUpperCase();
        displayName.textContent = userName;
        console.log('User display updated');
    }
}
// Remove demo chat creation function (no longer needed)
// Users will start with a clean chat history

// Set up all event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Setup form event listener
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        setupForm.addEventListener('submit', handleSetup);
        console.log('Setup form listener added');
    }
    
    // Chat input event listeners
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        console.log('Message input found, adding event listeners');
        
        // Enter key to send message
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter key pressed, sending message');
                sendMessage();
            }
        });

        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
    }
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (window.innerWidth <= 768 && 
            sidebar && mobileMenuBtn && overlay &&
            !sidebar.contains(event.target) && 
            !mobileMenuBtn.contains(event.target) &&
            !sidebar.classList.contains('mobile-hidden')) {
            sidebar.classList.add('mobile-hidden');
            overlay.classList.remove('active');
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (window.innerWidth > 768 && sidebar && overlay) {
            sidebar.classList.remove('mobile-hidden');
            overlay.classList.remove('active');
        }
    });
    
    console.log('Event listeners setup complete');
}

// Update greeting based on time of day
function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    }
    
    const greetingElement = document.getElementById('greetingText');
    if (greetingElement) {
        greetingElement.textContent = `${greeting}, ${userName}`;
    }
}

// Get greeting text based on current time
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

// Start a new chat conversation
function startNewChat() {
    console.log('Starting new chat...');
    currentChatId = 'chat_' + Date.now();
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        // Add fade out effect before changing content
        chatMessages.style.opacity = '0.3';
        chatMessages.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            chatMessages.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <div class="greeting">
                        <span class="greeting-icon">
                            <svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>
                        </span>
                        <span id="greetingText">${getGreeting()}, ${userName}</span>
                    </div>
                    
                    <div class="upgrade-notice">
                        Powered by Demo AI - Full UI Experience
                        <div class="tools-indicator">
                            <div class="tool-dot"></div>
                            <div class="tool-dot"></div>
                            <div class="tool-dot"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Fade back in with scale effect
            chatMessages.style.transition = 'all 0.4s ease-out';
            chatMessages.style.opacity = '1';
            chatMessages.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Clear active chat history
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.classList.remove('active');
    });
    
    console.log('New chat started with ID:', currentChatId);
}

// Send a message
async function sendMessage() {
    console.log('sendMessage() called');
    const input = document.getElementById('messageInput');
    
    if (!input) {
        console.error('Message input not found!');
        return;
    }
    
    const message = input.value.trim();
    console.log('Message:', message, 'isTyping:', isTyping);
    
    if (!message || isTyping) {
        console.log('Message sending cancelled - empty message or already typing');
        return;
    }
    
    // Add user message
    console.log('Adding user message...');
    addMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Show typing indicator
    console.log('Showing typing indicator...');
    showTypingIndicator();
    
    try {
        // Get AI response
        console.log('Getting AI response...');
        const response = await getAIResponse(message);
        console.log('AI response received:', response.substring(0, 50) + '...');
        hideTypingIndicator();
        addMessage('assistant', response);
        
        // Save to chat history
        saveChatToHistory(message);
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        hideTypingIndicator();
        addMessage('assistant', 'I apologize, but I encountered an error while processing your request. This is a demo interface showing UI functionality.');
    }
}

// Add a message to the chat
function addMessage(sender, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const emptyState = document.getElementById('emptyState');
    
    if (!messagesContainer) {
        console.error('Messages container not found!');
        return;
    }
    
    // Remove empty state on first message
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'user') {
        avatar.textContent = userName.charAt(0).toUpperCase();
    } else {
        // Use Claude SVG logo for AI avatar
        avatar.innerHTML = '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>';
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // Enhanced user message formatting with dynamic identity
    if (sender === 'user') {
        // Professional formatting for user messages
        messageText.innerHTML = text;
        
        // Add message metadata for professional display
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        // Add professional styling attributes with dynamic user data
        messageText.setAttribute('data-sender', userName.toUpperCase());
        messageText.setAttribute('data-role', userRole);
        messageText.setAttribute('data-time', timestamp);
        
        // Ensure proper styling class is applied
        messageDiv.classList.add('user-message-professional');
    } else {
        messageText.textContent = text;
    }
    
    content.appendChild(messageText);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    
    // Trigger animation after element is added to DOM
    requestAnimationFrame(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.5s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save message to chat storage if we have a current chat
    if (currentChatId) {
        saveMessageToChat(currentChatId, sender, text);
    }
    
    console.log('Message added:', sender, text.substring(0, 50) + '...');
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    const messagesContainer = document.getElementById('chatMessages');
    
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    // Use Claude SVG logo for typing indicator avatar
    avatar.innerHTML = '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'claude-loader';
    typingIndicator.innerHTML = `
        <svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>
        <span class="loader-text">Claude is thinking...</span>
    `;
    
    content.appendChild(typingIndicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Get AI response (handles both real API and demo responses)
async function getAIResponse(message) {
    console.log('Getting AI response for:', message, 'API Mode:', isUsingRealAPI ? 'Real' : 'Demo');
    
    if (isUsingRealAPI && apiKey) {
        // Use real Gemini 2.5 Flash API
        try {
            console.log('Making real API call to Gemini 2.5 Flash...');
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Real API response received');
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn('API call failed, falling back to demo mode');
                isUsingRealAPI = false; // Fallback to demo for this session
                return await getDemoResponse(message);
            }
        } catch (error) {
            console.warn('API error, falling back to demo mode:', error);
            return await getDemoResponse(message);
        }
    } else {
        // Use demo responses
        return await getDemoResponse(message);
    }
}

// Generate demo responses
async function getDemoResponse(message) {
    console.log('Generating demo AI response for:', message);
    
    try {
        // Simulate realistic API delay
        const delay = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Demo responses based on message content and user interests
        const responses = [
            `Hello ${userName}! I understand you're asking about "${message}". This is a demo response showcasing the Claude UI interface.`,
            `That's an interesting question about "${message}"! This demo interface replicates Claude's chat experience with full UI functionality.`,
            `Thanks for your message regarding "${message}". This demonstration shows how the chat interface handles conversations seamlessly.`,
            `I appreciate your input about "${message}". This UI replica provides a complete chat experience with typing indicators and message history.`,
            `Great question about "${message}"! This interface demonstrates all the interactive features of a modern AI chat application.`,
            `Your message "${message}" is noted. This demo showcases responsive design, smooth animations, and intuitive user interactions.`
        ];
        
        // Add some intelligence based on message content and user interests
        let response;
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            response = `Hello ${userName}! Welcome to this Claude UI demonstration. How can I help you today?`;
        } else if (lowerMessage.includes('how are you')) {
            response = `I'm doing well, thank you for asking! I'm a demo AI showcasing this beautiful chat interface. What would you like to explore?`;
        } else if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
            response = `I'm here to demonstrate the functionality of this Claude-inspired chat interface! You can:

• Send messages and see AI responses
• Toggle the sidebar with the arrow button
• Start new chats with the + button
• Experience smooth typing animations
• See your chat history in the sidebar
• Edit your profile and manage chats

This is a fully functional UI demonstration!`;
        } else if (userInterests && (lowerMessage.includes('python') || lowerMessage.includes('code'))) {
            response = `I see you're interested in ${userInterests}! This interface could easily be integrated with real AI APIs like OpenAI or Google's Gemini. The modular JavaScript structure makes it simple to swap out the demo responses for actual API calls.`;
        } else if (lowerMessage.includes('api') || lowerMessage.includes('key')) {
            if (isUsingRealAPI) {
                response = `You're currently using a real Gemini 2.5 Flash API key for responses! This means you're getting actual AI-generated content.`;
            } else {
                response = `You're currently in demo mode. To get real AI responses, you can click on your profile in the sidebar and add your Gemini 2.5 Flash API key.`;
            }
        } else if (userInterests) {
            // Personalize response based on user interests
            response = `Based on your interests in ${userInterests}, I can see you'd appreciate how this interface demonstrates modern web development principles. ${responses[Math.floor(Math.random() * responses.length)]}`;
        } else {
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        return response;
        
    } catch (error) {
        console.error('Error generating demo response:', error);
        throw new Error('Demo response generation failed');
    }
}

// Save chat to history
function saveChatToHistory(firstMessage) {
    if (!currentChatId) {
        currentChatId = 'chat_' + Date.now();
    }
    
    const existingChat = chatHistory.find(chat => chat.id === currentChatId);
    
    if (!existingChat) {
        const newChat = {
            id: currentChatId,
            title: firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage,
            timestamp: Date.now()
        };
        
        chatHistory.unshift(newChat);
        
        // Keep only last 10 chats
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(0, 10);
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
            console.log('Chat saved to history:', newChat.title);
        } catch (error) {
            console.warn('Could not save chat history to localStorage:', error);
        }
        
        // Force update display
        updateChatHistoryDisplay();
    }
}

// Save a message to chat storage
function saveMessageToChat(chatId, sender, message) {
    if (!chatMessages[chatId]) {
        chatMessages[chatId] = [];
    }
    
    const messageData = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sender: sender,
        content: message,
        timestamp: Date.now()
    };
    
    chatMessages[chatId].push(messageData);
    
    // Save to localStorage
    try {
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
        console.log('Message saved to chat:', chatId, sender);
    } catch (error) {
        console.warn('Could not save chat messages to localStorage:', error);
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            chatHistory = JSON.parse(saved);
            console.log('Loaded chat history from localStorage:', chatHistory.length, 'chats');
            // Force immediate update
            updateChatHistoryDisplay();
        } else {
            console.log('No saved chat history found');
            chatHistory = [];
        }
        
        // Load chat messages
        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            chatMessages = JSON.parse(savedMessages);
            console.log('Loaded chat messages from localStorage');
        } else {
            chatMessages = {};
        }
    } catch (error) {
        console.warn('Could not load chat history from localStorage:', error);
        chatHistory = [];
        chatMessages = {};
    }
}

// Update chat history display in sidebar
function updateChatHistoryDisplay() {
    const historyContainer = document.getElementById('chatHistory');
    if (!historyContainer) {
        console.warn('Chat history container not found!');
        return;
    }
    
    console.log('Updating chat history display with', chatHistory.length, 'chats');
    historyContainer.innerHTML = '';
    
    if (chatHistory.length === 0) {
        // Show message when no chats exist
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'chat-history-empty';
        emptyMsg.textContent = 'No recent chats';
        emptyMsg.style.cssText = `
            color: #666;
            font-size: 12px;
            text-align: center;
            padding: 20px 10px;
            font-style: italic;
        `;
        historyContainer.appendChild(emptyMsg);
        console.log('Displayed empty state message');
        return;
    }
    
    chatHistory.forEach((chat, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-item-wrapper';
        wrapper.setAttribute('data-chat-id', chat.id);
        
        // Chat content section
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        chatContent.style.cssText = `
            display: flex;
            flex-direction: column;
            cursor: pointer;
            flex: 1;
            min-width: 0;
        `;
        
        // Chat title
        const title = document.createElement('div');
        title.className = 'chat-title';
        title.textContent = chat.title;
        title.style.cssText = `
            font-size: 14px;
            color: #e5e5e5;
            font-weight: 500;
            margin-bottom: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        
        // Chat timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'chat-timestamp';
        const date = new Date(chat.timestamp);
        const timeString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        timestamp.textContent = timeString;
        timestamp.style.cssText = `
            font-size: 11px;
            color: #888;
            font-weight: 400;
        `;
        
        chatContent.appendChild(title);
        chatContent.appendChild(timestamp);
        
        // Chat actions section
        const chatActions = document.createElement('div');
        chatActions.className = 'chat-actions';
        
        // Rename button
        const renameBtn = document.createElement('button');
        renameBtn.className = 'chat-action-btn rename-icon';
        renameBtn.title = 'Rename chat';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            startRenameChat(chat.id, title);
        };
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'chat-action-btn delete-icon';
        deleteBtn.title = 'Delete chat';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
        };
        
        chatActions.appendChild(renameBtn);
        chatActions.appendChild(deleteBtn);
        
        // Assemble wrapper
        wrapper.appendChild(chatContent);
        wrapper.appendChild(chatActions);
        
        // Click handler for loading chat
        chatContent.onclick = (e) => {
            e.stopPropagation();
            console.log('Chat item clicked:', chat.id, chat.title);
            loadChat(chat.id, wrapper);
        };
        
        // Hover effects
        wrapper.addEventListener('mouseenter', () => {
            if (!wrapper.classList.contains('active')) {
                wrapper.style.backgroundColor = '#3a3a3a';
                title.style.color = '#fff';
            }
        });
        
        wrapper.addEventListener('mouseleave', () => {
            if (!wrapper.classList.contains('active')) {
                wrapper.style.backgroundColor = 'transparent';
                title.style.color = '#e5e5e5';
            }
        });
        
        historyContainer.appendChild(wrapper);
    });
    
    console.log('Chat history updated with', chatHistory.length, 'items');
}

// Start renaming a chat
function startRenameChat(chatId, titleElement) {
    const chat = chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    const originalText = titleElement.textContent;
    const input = document.createElement('input');
    input.className = 'chat-title-input';
    input.value = originalText;
    input.maxLength = 100;
    
    // Replace title with input
    titleElement.style.display = 'none';
    titleElement.parentNode.insertBefore(input, titleElement);
    
    // Focus and select all
    input.focus();
    input.select();
    
    // Handle save/cancel
    const saveRename = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            chat.title = newTitle;
            titleElement.textContent = newTitle;
            saveChatHistory();
        }
        input.remove();
        titleElement.style.display = 'block';
    };
    
    const cancelRename = () => {
        input.remove();
        titleElement.style.display = 'block';
    };
    
    input.addEventListener('blur', saveRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveRename();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelRename();
        }
    });
}

// Delete a chat
function deleteChat(chatId) {
    if (!confirm('Are you sure you want to delete this chat?')) {
        return;
    }
    
    const chatIndex = chatHistory.findIndex(c => c.id === chatId);
    if (chatIndex === -1) return;
    
    // Remove from history
    chatHistory.splice(chatIndex, 1);
    saveChatHistory();
    
    // If this was the current chat, start a new one
    if (currentChatId === chatId) {
        startNewChat();
    }
    
    updateChatHistoryDisplay();
    console.log('Chat deleted:', chatId);
}

// Save chat history to localStorage
function saveChatHistory() {
    try {
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        console.log('Chat history saved to localStorage, total chats:', chatHistory.length);
        // Force update display after save
        updateChatHistoryDisplay();
    } catch (error) {
        console.warn('Could not save chat history to localStorage:', error);
    }
}

// Load a specific chat
function loadChat(chatId, clickedElement = null) {
    console.log('Loading chat:', chatId);
    
    // Update active state with visual feedback
    document.querySelectorAll('.chat-item-wrapper').forEach(item => {
        item.classList.remove('active');
        item.style.backgroundColor = 'transparent';
        const title = item.querySelector('.chat-title');
        if (title) title.style.color = '#e5e5e5';
    });
    
    // Activate clicked item
    if (clickedElement) {
        clickedElement.classList.add('active');
        clickedElement.style.backgroundColor = '#e87953';
        const title = clickedElement.querySelector('.chat-title');
        if (title) title.style.color = 'white';
    }
    
    // Find the chat data
    const chatData = chatHistory.find(chat => chat.id === chatId);
    if (chatData) {
        console.log('Found chat data:', chatData.title);
        
        // Set current chat ID
        currentChatId = chatId;
        
        // Clear current messages
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (chatMessagesContainer) {
            chatMessagesContainer.innerHTML = '';
        }
        
        // Load and display actual conversation history
        const conversationMessages = chatMessages[chatId] || [];
        console.log('Loading', conversationMessages.length, 'messages for chat:', chatId);
        
        if (conversationMessages.length === 0) {
            // Show empty state for chats without messages
            chatMessagesContainer.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <div class="greeting">
                        <span class="greeting-icon">
                            <svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>
                        </span>
                        <span id="greetingText">Continue conversation: "${chatData.title}"</span>
                    </div>
                    
                    <div class="upgrade-notice">
                        Previous Chat • ${new Date(chatData.timestamp).toLocaleDateString()}
                        <div class="tools-indicator">
                            <div class="tool-dot"></div>
                            <div class="tool-dot"></div>
                            <div class="tool-dot"></div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Display actual conversation messages with staggered animation
            conversationMessages.forEach((msg, index) => {
                setTimeout(() => {
                    addMessageFromHistory(msg.sender, msg.content, msg.timestamp);
                }, index * 150); // Stagger the animations
            });
        }
        
    } else {
        console.error('Chat not found:', chatId);
        // Fallback to new chat
        startNewChat();
    }
}

// Add a message from history (without saving it again)
function addMessageFromHistory(sender, text, timestamp) {
    const messagesContainer = document.getElementById('chatMessages');
    const emptyState = document.getElementById('emptyState');
    
    if (!messagesContainer) {
        console.error('Messages container not found!');
        return;
    }
    
    // Remove empty state on first message
    if (emptyState) {
        emptyState.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    if (sender === 'user') {
        avatar.textContent = userName.charAt(0).toUpperCase();
    } else {
        // Use Claude SVG logo for AI avatar
        avatar.innerHTML = '<svg height="1em" style="flex:none;line-height:1" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Claude</title><path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" fill="#D97757" fill-rule="nonzero"></path></svg>';
    }
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    // Enhanced user message formatting with dynamic identity
    if (sender === 'user') {
        messageText.innerHTML = text;
        
        const time = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        messageText.setAttribute('data-sender', userName.toUpperCase());
        messageText.setAttribute('data-role', userRole);
        messageText.setAttribute('data-time', time);
        
        messageDiv.classList.add('user-message-professional');
    } else {
        messageText.textContent = text;
    }
    
    content.appendChild(messageText);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    messagesContainer.appendChild(messageDiv);
    
    // Trigger animation for history messages
    requestAnimationFrame(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(15px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.4s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Sidebar functionality
function toggleSidebar() {
    console.log('toggleSidebar() called');
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggleIcon');
    
    console.log('Sidebar element:', sidebar, 'Toggle icon:', toggleIcon);
    
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
        
        if (sidebar.classList.contains('collapsed')) {
            if (toggleIcon) toggleIcon.textContent = '›';
            console.log('Sidebar collapsed');
        } else {
            if (toggleIcon) toggleIcon.textContent = '‹';
            console.log('Sidebar expanded');
        }
    } else {
        console.error('Sidebar element not found!');
    }
}

// Mobile sidebar toggle
function toggleMobileSidebar() {
    console.log('toggleMobileSidebar() called');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    console.log('Mobile sidebar toggle - Sidebar:', sidebar, 'Overlay:', overlay);
    
    if (sidebar) {
        sidebar.classList.toggle('mobile-hidden');
        console.log('Mobile sidebar hidden:', sidebar.classList.contains('mobile-hidden'));
    }
    
    if (overlay) {
        overlay.classList.toggle('active');
        console.log('Overlay active:', overlay.classList.contains('active'));
    }
}

// Utility function to clear all chats
function clearChatHistory() {
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    updateChatHistoryDisplay();
    startNewChat();
    console.log('Chat history cleared');
}

// Initialize scroll effects for chat messages
function initializeScrollEffects() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    let scrollTimeout;
    
    chatMessages.addEventListener('scroll', () => {
        const scrollTop = chatMessages.scrollTop;
        
        // Add scrolled class for top fade effect only
        if (scrollTop > 20) {
            chatMessages.classList.add('scrolled');
        } else {
            chatMessages.classList.remove('scrolled');
        }
        
        // Handle message fade effects during scroll
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleMessageVisibility();
        }, 100);
    });
}

// Handle message visibility during scroll
function handleMessageVisibility() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = chatMessages.querySelectorAll('.message');
    const containerRect = chatMessages.getBoundingClientRect();
    
    messages.forEach(message => {
        const messageRect = message.getBoundingClientRect();
        const relativeTop = messageRect.top - containerRect.top;
        const relativeBottom = messageRect.bottom - containerRect.top;
        
        // Message is above visible area
        if (relativeBottom < -20) {
            message.classList.add('fade-out-top');
            message.classList.remove('fade-out-bottom');
        }
        // Message is below visible area
        else if (relativeTop > containerRect.height + 20) {
            message.classList.add('fade-out-bottom');
            message.classList.remove('fade-out-top');
        }
        // Message is in visible area
        else {
            message.classList.remove('fade-out-top', 'fade-out-bottom');
        }
    });
}

// Profile Modal Functions
function openProfileSettings() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;
    
    // Populate current values
    const profileName = document.getElementById('profileName');
    const profileInterests = document.getElementById('profileInterests');
    const profileApiKey = document.getElementById('profileApiKey');
    const apiStatus = document.getElementById('apiStatus');
    
    if (profileName) profileName.value = userName;
    if (profileInterests) profileInterests.value = userInterests;
    if (profileApiKey) profileApiKey.value = apiKey;
    
    // Update API status
    if (apiStatus) {
        if (isUsingRealAPI && apiKey) {
            apiStatus.innerHTML = '<span style="color: #4ade80;">●</span> Connected - Using real Gemini 2.5 Flash responses';
            apiStatus.className = 'api-status connected';
        } else if (apiKey) {
            apiStatus.innerHTML = '<span style="color: #f59e0b;">▲</span> API key present but not validated';
            apiStatus.className = 'api-status error';
        } else {
            apiStatus.innerHTML = '<span style="color: #9ca3af;">○</span> Demo mode - No API key configured';
            apiStatus.className = 'api-status disconnected';
        }
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Focus first input
    if (profileName) profileName.focus();
}

function closeProfileSettings() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function saveProfile() {
    const profileName = document.getElementById('profileName');
    const profileInterests = document.getElementById('profileInterests');
    const profileApiKey = document.getElementById('profileApiKey');
    const apiStatus = document.getElementById('apiStatus');
    
    const newName = profileName?.value.trim() || '';
    const newInterests = profileInterests?.value.trim() || '';
    const newApiKey = profileApiKey?.value.trim() || '';
    
    if (!newName) {
        alert('Name is required');
        profileName?.focus();
        return;
    }
    
    try {
        // Update user data
        const oldName = userName;
        userName = newName;
        userInterests = newInterests;
        
        // Determine user role based on interests
        if (newInterests.toLowerCase().includes('python')) {
            userRole = 'Python Developer';
        } else if (newInterests.toLowerCase().includes('javascript') || newInterests.toLowerCase().includes('web')) {
            userRole = 'Web Developer';
        } else if (newInterests.toLowerCase().includes('cybersecurity') || newInterests.toLowerCase().includes('security')) {
            userRole = 'Security Specialist';
        } else if (newInterests.toLowerCase().includes('data') || newInterests.toLowerCase().includes('analysis')) {
            userRole = 'Data Analyst';
        } else if (newInterests.toLowerCase().includes('machine learning') || newInterests.toLowerCase().includes('ai')) {
            userRole = 'ML Engineer';
        } else if (newInterests) {
            userRole = 'Developer';
        } else {
            userRole = 'AI Assistant User';
        }
        
        // Handle API key changes
        const oldApiKey = apiKey;
        if (newApiKey !== oldApiKey) {
            if (newApiKey && newApiKey.length > 10) {
                // Test new API key
                apiStatus.textContent = '⏳ Validating API key...';
                apiStatus.className = 'api-status';
                
                const isValid = await testGeminiAPIKey(newApiKey);
                
                if (isValid) {
                    apiKey = newApiKey;
                    isUsingRealAPI = true;
                    apiStatus.innerHTML = '<span style="color: #4ade80;">●</span> API key validated successfully';
                    apiStatus.className = 'api-status connected';
                } else {
                    apiStatus.innerHTML = '<span style="color: #ef4444;">×</span> Invalid API key - continuing in demo mode';
                    apiStatus.className = 'api-status error';
                    apiKey = '';
                    isUsingRealAPI = false;
                }
            } else {
                // No API key provided
                apiKey = '';
                isUsingRealAPI = false;
                apiStatus.innerHTML = '<span style="color: #9ca3af;">○</span> Demo mode - No API key configured';
                apiStatus.className = 'api-status disconnected';
            }
        }
        
        // Save to localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userInterests', userInterests);
        localStorage.setItem('userRole', userRole);
        if (apiKey) {
            localStorage.setItem('apiKey', apiKey);
        } else {
            localStorage.removeItem('apiKey');
        }
        localStorage.setItem('isUsingRealAPI', isUsingRealAPI.toString());
        
        // Update UI
        updateUserDisplay();
        updateGreeting();
        
        // Show success message briefly
        setTimeout(() => {
            if (apiStatus) {
                if (isUsingRealAPI && apiKey) {
                    apiStatus.innerHTML = '<span style="color: #4ade80;">●</span> Connected - Using real Gemini 2.5 Flash responses';
                    apiStatus.className = 'api-status connected';
                } else {
                    apiStatus.innerHTML = '<span style="color: #9ca3af;">○</span> Demo mode - No API key configured';
                    apiStatus.className = 'api-status disconnected';
                }
            }
        }, 3000);
        
        console.log('Profile updated successfully');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        if (apiStatus) {
            apiStatus.innerHTML = '<span style="color: #ef4444;">×</span> Error saving profile';
            apiStatus.className = 'api-status error';
        }
    }
}

function clearAllChats() {
    if (confirm('Are you sure you want to delete ALL chat history? This cannot be undone.')) {
        clearChatHistory();
        alert('All chats have been deleted.');
    }
}

// Export functions for global access (if needed)
window.sendMessage = sendMessage;
window.startNewChat = startNewChat;
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.clearChatHistory = clearChatHistory;
window.openProfileSettings = openProfileSettings;
window.closeProfileSettings = closeProfileSettings;
window.saveProfile = saveProfile;
window.clearAllChats = clearAllChats;

console.log('Claude UI JavaScript loaded successfully');