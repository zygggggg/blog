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
function sendMessage() {
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

    // 模拟角色回复（延迟1秒）
    setTimeout(() => {
        const botReply = generateBotReply(text);
        addMessage('bot', botReply);
    }, 1000);
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

// 生成机器人回复（简单的关键词匹配）
function generateBotReply(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // 关键词回复
    if (lowerMessage.includes('你好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        return '你好！很高兴见到你！有什么我可以帮助你的吗？😊';
    }

    if (lowerMessage.includes('名字') || lowerMessage.includes('叫什么')) {
        return '我是 WZY 助手，一个智能对话助手。很高兴为你服务！';
    }

    if (lowerMessage.includes('帮助') || lowerMessage.includes('help')) {
        return '我可以和你聊天、回答问题。你可以问我任何事情，我会尽力帮助你！💪';
    }

    if (lowerMessage.includes('时间')) {
        const now = new Date();
        return `现在是 ${now.toLocaleString('zh-CN')}`;
    }

    if (lowerMessage.includes('天气')) {
        return '抱歉，我暂时无法查询天气信息。你可以访问天气网站获取最新天气预报。🌤️';
    }

    if (lowerMessage.includes('再见') || lowerMessage.includes('拜拜') || lowerMessage.includes('bye')) {
        return '再见！期待下次与你聊天！👋';
    }

    if (lowerMessage.includes('技术') || lowerMessage.includes('编程') || lowerMessage.includes('代码')) {
        return '我对技术很感兴趣！你想聊聊哪方面的技术呢？前端、后端还是其他？💻';
    }

    if (lowerMessage.includes('前端')) {
        return '前端开发很有趣！HTML、CSS、JavaScript 是基础，React、Vue 等框架也很流行。你在学习哪个方向呢？';
    }

    if (lowerMessage.includes('后端')) {
        return '后端开发涉及服务器、数据库、API 等。Node.js、Python、Java 都是不错的选择！';
    }

    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
        return '不客气！很高兴能帮到你！😊';
    }

    // 默认回复
    const defaultReplies = [
        '这是个有趣的话题！能详细说说吗？🤔',
        '我理解你的意思了。还有什么想聊的吗？',
        '嗯嗯，继续说下去吧！我在认真听呢！👂',
        '有意思！你对这个话题有什么看法？',
        '我明白了。你还想了解什么呢？',
        '说得对！我也这么认为。✨',
        '这个问题很好！让我想想...🤔',
        '原来如此！你真是太聪明了！🌟'
    ];

    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
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
