// 留言板功能 - Railway 后端地址
const API_BASE_URL = 'https://blog-production-24dd.up.railway.app/api/board';

let messages = [];

// 页面加载
window.onload = function() {
    loadMessages();
    initEventListeners();
};

// 初始化事件监听
function initEventListeners() {
    const postBtn = document.getElementById('postBtn');
    const messageInput = document.getElementById('messageInput');
    const nicknameInput = document.getElementById('nicknameInput');
    const clearAllBtn = document.getElementById('clearAllBtn');

    // 发表留言按钮
    postBtn.addEventListener('click', postMessage);

    // 回车发送（Ctrl+Enter）
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            postMessage();
        }
    });

    // 字符计数
    messageInput.addEventListener('input', function() {
        const charCount = document.querySelector('.char-count');
        charCount.textContent = `${this.value.length}/500`;
    });

    // 清空所有留言
    clearAllBtn.addEventListener('click', clearAllMessages);
}

// 发表留言
async function postMessage() {
    const nicknameInput = document.getElementById('nicknameInput');
    const messageInput = document.getElementById('messageInput');

    const nickname = nicknameInput.value.trim();
    const content = messageInput.value.trim();

    // 验证
    if (!nickname) {
        alert('请输入昵称！');
        nicknameInput.focus();
        return;
    }

    if (!content) {
        alert('请输入留言内容！');
        messageInput.focus();
        return;
    }

    try {
        // 调用后端 API
        const response = await fetch(`${API_BASE_URL}/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: nickname,
                content: content
            })
        });

        const result = await response.json();

        if (result.code === 200) {
            // 清空输入框
            messageInput.value = '';
            document.querySelector('.char-count').textContent = '0/500';

            // 显示成功提示
            showToast('留言发表成功！');

            // 重新加载留言列表
            await loadMessages();
        } else {
            alert('发表失败: ' + result.message);
        }
    } catch (error) {
        console.error('Post message error:', error);
        alert('发表失败: ' + error.message);
    }
}

// 加载留言列表
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/list?page=1&size=100`);
        const result = await response.json();

        if (result.code === 200) {
            messages = result.data.list;
            renderMessages();
        } else {
            console.error('Load messages failed:', result.message);
            renderMessages();
        }
    } catch (error) {
        console.error('Load messages error:', error);
        renderMessages();
    }
}

// 渲染留言列表
function renderMessages() {
    const messagesList = document.getElementById('messagesList');

    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-message">
                <p>还没有留言，快来抢沙发吧！</p>
            </div>
        `;
        return;
    }

    messagesList.innerHTML = '';

    messages.forEach((message, index) => {
        const messageCard = document.createElement('div');
        messageCard.className = 'message-card';
        messageCard.setAttribute('data-id', message.id);

        // 使用 homepic 图片作为头像，循环使用 1-4
        const avatarNum = (index % 4) + 1;
        const avatarUrl = `../image/homepic${avatarNum}.png`;

        // 格式化时间
        const time = formatMessageTime(message.createTime);

        messageCard.innerHTML = `
            <div class="message-header">
                <div class="message-author">
                    <img src="${avatarUrl}" alt="avatar" class="author-avatar" />
                    <span class="author-name">${escapeHtml(message.nickname)}</span>
                </div>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="message-actions">
                <button class="delete-btn" onclick="deleteMessage(${message.id})">🗑️ 删除</button>
            </div>
        `;

        messagesList.appendChild(messageCard);
    });
}

// 格式化留言时间
function formatMessageTime(timeString) {
    if (!timeString) return '刚刚';

    const date = new Date(timeString);

    // 检查日期是否有效
    if (isNaN(date.getTime()) || date.getTime() === 0) {
        return '刚刚';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 删除留言
async function deleteMessage(id) {
    if (!confirm('确定要删除这条留言吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 200) {
            showToast('留言已删除');
            await loadMessages();
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        console.error('Delete message error:', error);
        alert('删除失败: ' + error.message);
    }
}

// 清空所有留言
async function clearAllMessages() {
    if (messages.length === 0) {
        alert('当前没有留言');
        return;
    }

    if (!confirm('确定要清空所有留言吗？此操作不可恢复！')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/clear`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 200) {
            showToast('所有留言已清空');
            await loadMessages();
        } else {
            alert('清空失败: ' + result.message);
        }
    } catch (error) {
        console.error('Clear messages error:', error);
        alert('清空失败: ' + error.message);
    }
}

// HTML 转义（防止 XSS）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示提示消息
function showToast(message) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        font-weight: 600;
    `;

    document.body.appendChild(toast);

    // 2秒后移除
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}
