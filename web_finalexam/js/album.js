// API 配置 - Railway 后端地址
const API_BASE_URL = 'https://blog-production-24dd.up.railway.app/api/album';

// 全局变量
let currentPage = 1;
let pageSize = 20;

// 缓存配置
const CACHE_KEY = 'album_images_cache';
const CACHE_EXPIRY_KEY = 'album_images_cache_expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

// 页面加载
window.onload = function() {
    // 加载图片列表
    loadImages();

    // 初始化上传功能
    initUpload();
};

// 从后端加载图片列表
async function loadImages(forceRefresh = false) {
    try {
        // 检查缓存（除非强制刷新）
        if (!forceRefresh) {
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
            const now = Date.now();

            if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
                console.log('✅ 使用缓存的相册图片列表');
                const cachedResult = JSON.parse(cachedData);
                displayImages(cachedResult.list);
                return;
            }
        }

        console.log('📡 正在从 API 获取相册图片列表...');
        const response = await fetch(`${API_BASE_URL}/list?page=${currentPage}&size=${pageSize}`);
        const result = await response.json();

        if (result.code === 200) {
            console.log('✅ 成功加载相册图片列表');

            // 缓存数据
            const now = Date.now();
            localStorage.setItem(CACHE_KEY, JSON.stringify(result.data));
            localStorage.setItem(CACHE_EXPIRY_KEY, (now + CACHE_DURATION).toString());

            displayImages(result.data.list);
        } else {
            console.error('加载图片失败:', result.message);
            displayImages([]);
        }
    } catch (error) {
        console.error('加载图片失败:', error);
        displayImages([]);
    }
}

// 显示图片网格
function displayImages(images) {
    const banner = document.getElementById('banner');
    banner.innerHTML = '';

    if (images.length === 0) {
        banner.innerHTML = '<div class="empty-message">暂无图片，点击右上角上传按钮添加图片</div>';
        return;
    }

    // 按上传时间倒序排列（新的在前面）
    images.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));

    images.forEach((image, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.setAttribute('data-id', image.id);

        imageCard.innerHTML = `
            <div class="image-wrapper">
                <img src="${image.fileUrl}"
                     alt="${image.description || '图片'}"
                     loading="lazy"
                     decoding="async">
                <div class="image-overlay">
                    <div class="image-info">
                        <p class="image-desc">${image.description || '无描述'}</p>
                        <p class="image-date">${formatDate(image.uploadTime)}</p>
                    </div>
                    <div class="image-actions">
                        <button class="btn-view" onclick="viewImage('${image.fileUrl}', '${image.description || ''}')">
                            👁️ 查看
                        </button>
                        <button class="btn-delete" onclick="deleteImage(${image.id})">
                            🗑️ 删除
                        </button>
                    </div>
                </div>
            </div>
        `;

        banner.appendChild(imageCard);
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 查看大图
function viewImage(url, description) {
    const modal = document.createElement('div');
    modal.className = 'view-modal';
    modal.innerHTML = `
        <div class="view-modal-content">
            <span class="view-close">&times;</span>
            <img src="${url}" alt="${description}">
            <p class="view-description">${description || '无描述'}</p>
        </div>
    `;

    document.body.appendChild(modal);

    // 关闭按钮
    const closeBtn = modal.querySelector('.view-close');
    closeBtn.onclick = function() {
        document.body.removeChild(modal);
    };

    // 点击背景关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// 删除图片
async function deleteImage(id) {
    if (!confirm('确定要删除这张图片吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 200) {
            alert('删除成功！');
            // 清除缓存
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_EXPIRY_KEY);
            // 重新加载图片列表（强制刷新）
            loadImages(true);
        } else {
            alert('删除失败: ' + result.message);
        }
    } catch (error) {
        alert('删除失败: ' + error.message);
    }
}

// 初始化上传功能
function initUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const uploadModal = document.getElementById('uploadModal');
    const closeBtn = document.querySelector('.close');
    const confirmUpload = document.getElementById('confirmUpload');
    const previewArea = document.getElementById('previewArea');
    const descInput = document.getElementById('descInput');
    const uploadProgress = document.getElementById('uploadProgress');
    let selectedFile = null;

    // 点击上传按钮
    uploadBtn.onclick = function() {
        fileInput.click();
    };

    // 选择文件
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
                alert('请选择图片文件！');
                return;
            }

            // 验证文件大小（10MB）
            if (file.size > 10 * 1024 * 1024) {
                alert('图片大小不能超过10MB！');
                return;
            }

            selectedFile = file;

            // 预览图片
            const reader = new FileReader();
            reader.onload = function(e) {
                previewArea.innerHTML = `<img src="${e.target.result}" alt="预览">`;
                previewArea.classList.remove('empty');
            };
            reader.readAsDataURL(file);

            // 显示弹窗
            uploadModal.style.display = 'block';
            descInput.value = '';
            uploadProgress.textContent = '';
        }
    };

    // 关闭弹窗
    closeBtn.onclick = function() {
        uploadModal.style.display = 'none';
        selectedFile = null;
        previewArea.innerHTML = '';
        previewArea.classList.add('empty');
        fileInput.value = '';
    };

    // 点击弹窗外部关闭
    window.onclick = function(event) {
        if (event.target == uploadModal) {
            uploadModal.style.display = 'none';
            selectedFile = null;
            previewArea.innerHTML = '';
            previewArea.classList.add('empty');
            fileInput.value = '';
        }
    };

    // 确认上传
    confirmUpload.onclick = async function() {
        if (!selectedFile) {
            alert('请先选择图片！');
            return;
        }

        const description = descInput.value.trim();

        // 禁用按钮
        confirmUpload.disabled = true;
        uploadProgress.textContent = '上传中...';

        try {
            await uploadImage(selectedFile, description);
            uploadProgress.textContent = '✅ 上传成功！';

            // 延迟关闭弹窗并刷新列表
            setTimeout(() => {
                uploadModal.style.display = 'none';
                selectedFile = null;
                previewArea.innerHTML = '';
                previewArea.classList.add('empty');
                confirmUpload.disabled = false;
                fileInput.value = '';

                // 清除缓存
                localStorage.removeItem(CACHE_KEY);
                localStorage.removeItem(CACHE_EXPIRY_KEY);
                // 重新加载图片列表（强制刷新）
                loadImages(true);
            }, 1000);

        } catch (error) {
            uploadProgress.textContent = '❌ 上传失败: ' + error.message;
            confirmUpload.disabled = false;
        }
    };

    previewArea.classList.add('empty');
}

// 上传图片到后端
async function uploadImage(file, description) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
        formData.append('description', description);
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    if (result.code !== 200) {
        throw new Error(result.message || '上传失败');
    }

    return result.data;
}
