// 聊天功能
let messages = [];

// 页面加载
window.onload = function() {
    // 从 localStorage 加载历史消息
    loadMessages();

    // 初始化事件监听
    initEventListeners();
};

// 初始化事件监听
function initEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    const clearBtn = document.getElementById('clearBtn');

    // 发送按钮点击
    sendBtn.addEventListener('click', sendMessage);

    // 回车发送（Shift+Enter 换行）
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自动调整输入框高度
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // 清空对话
    clearBtn.addEventListener('click', clearChat);
}

// 发送消息
async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    // 添加用户消息
    addMessage('user', text);

    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';

    // 显示"正在输入"提示
    const typingIndicator = addTypingIndicator();

    try {
        // 调用 Coze API 获取回复
        const botReply = await generateBotReply(text);

        // 移除"正在输入"提示
        removeTypingIndicator(typingIndicator);

        // 添加 Bot 回复
        addMessage('bot', botReply);
    } catch (error) {
        console.error('发送消息失败:', error);
        removeTypingIndicator(typingIndicator);
        addMessage('bot', '抱歉，我遇到了一些问题。请稍后再试。🙏');
    }
}

// 添加消息
function addMessage(type, text) {
    const message = {
        type: type,
        text: text,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    messages.push(message);
    saveMessages();
    renderMessage(message);
    scrollToBottom();
}

// 渲染消息
function renderMessage(message) {
    const chatMessages = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;

    if (message.type === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="../image/homepic1.png" alt="角色头像">
            </div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(message.text)}</div>
                <div class="message-time">${message.time}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="../image/homepic3.png" alt="用户头像">
            </div>
            <div class="message-content">
                <div class="message-bubble">${escapeHtml(message.text)}</div>
                <div class="message-time">${message.time}</div>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
}

// 后端 API 配置
const API_CONFIG = {
    baseUrl: 'https://blog-production-24dd.up.railway.app',  // Railway 后端地址
    chatEndpoint: '/api/chat/message'
};

// 调用后端 API 生成回复
async function generateBotReply(userMessage) {
    try {
        // 从 localStorage 获取或创建用户 ID
        let userId = localStorage.getItem('chatUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatUserId', userId);
        }

        const response = await fetch(API_CONFIG.baseUrl + API_CONFIG.chatEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                userId: userId
            })
        });

        if (!response.ok) {
            throw new Error('API 请求失败');
        }

        const data = await response.json();

        // 检查返回数据
        if (data.code === 200 && data.data && data.data.reply) {
            return data.data.reply;
        }

        // 如果没有找到有效回复，返回默认消息
        return '抱歉，我现在有点累，稍后再回复你吧！😊';
    } catch (error) {
        console.error('后端 API 调用失败:', error);
        // 出错时返回友好的错误提示
        return '抱歉，我遇到了一些问题。请稍后再试。🙏';
    }
}

// 清空对话
function clearChat() {
    if (!confirm('确定要清空所有对话记录吗？')) {
        return;
    }

    messages = [];
    saveMessages();

    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <p>👋 你好！我是 WZY 助手，有什么可以帮助你的吗？</p>
        </div>
    `;
}

// 滚动到底部
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 保存消息到 localStorage
function saveMessages() {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

// 从 localStorage 加载消息
function loadMessages() {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
        messages = JSON.parse(saved);
        messages.forEach(message => renderMessage(message));
        scrollToBottom();
    }
}

// HTML 转义（防止 XSS）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 添加"正在输入"指示器
function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="../image/homepic1.png" alt="角色头像">
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

// 移除"正在输入"指示器
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}
