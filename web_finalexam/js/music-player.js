// ====== 共享音乐播放器功能 ======
// 使用 localStorage 实现跨页面音乐播放

const audioPlayer = document.getElementById('audioPlayer');
let currentTrackIndex = 0;
let isLooping = false;
let isShuffling = false;

// 音乐列表
const playlist = [
    { title: '酣梦于彼岸深红', artist: 'fll', src: '../music/fll_酣梦于彼岸深红.ogg', cover: '../image/homepic1.png' },
    { title: '那颗星梦见的春日', artist: 'imiss', src: '../music/imiss_那颗星梦见的春日.ogg', cover: '../image/homepic1.png' },
    { title: '远航星的告别', artist: 'imiss', src: '../music/imiss_远航星的告别.ogg', cover: '../image/homepic1.png' }
];

// 保存音乐状态到 localStorage
function saveMusicState() {
    const player = document.getElementById('musicPlayer');
    const state = {
        currentTrackIndex: currentTrackIndex,
        isPlaying: !audioPlayer.paused,
        currentTime: audioPlayer.currentTime,
        isLooping: isLooping,
        isShuffling: isShuffling,
        playerVisible: player.classList.contains('show') // 保存播放器显示状态
    };
    localStorage.setItem('musicPlayerState', JSON.stringify(state));
}

// 从 localStorage 恢复音乐状态
function restoreMusicState() {
    const stateStr = localStorage.getItem('musicPlayerState');
    if (!stateStr) return;

    try {
        const state = JSON.parse(stateStr);
        currentTrackIndex = state.currentTrackIndex || 0;
        isLooping = state.isLooping || false;
        isShuffling = state.isShuffling || false;

        // 恢复UI状态
        updateLoopButton();
        updateShuffleButton();

        // 恢复播放器显示状态
        const player = document.getElementById('musicPlayer');
        if (state.playerVisible) {
            player.classList.add('show');
        }

        // 加载歌曲
        const track = playlist[currentTrackIndex];
        if (track) {
            audioPlayer.src = track.src;
            document.getElementById('musicTitle').textContent = track.title;
            document.getElementById('musicArtist').textContent = track.artist;
            document.getElementById('musicCover').src = track.cover;

            // 恢复播放进度
            if (state.currentTime) {
                // 等待音频加载后设置时间
                audioPlayer.addEventListener('loadedmetadata', function setTime() {
                    audioPlayer.currentTime = state.currentTime;
                    audioPlayer.removeEventListener('loadedmetadata', setTime);
                }, { once: true });
            }

            renderPlaylist();

            // 如果之前在播放，继续播放
            if (state.isPlaying) {
                // 使用 promise 来确保播放
                const playPromise = audioPlayer.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        updatePlayButton(true);
                    }).catch(err => {
                        console.log('自动播放被阻止:', err);
                        updatePlayButton(false);
                    });
                }
            }
        }
    } catch (e) {
        console.error('恢复音乐状态失败:', e);
    }
}

function initMusicPlayer() {
    // 渲染播放列表
    renderPlaylist();

    // 恢复之前的播放状态
    restoreMusicState();

    // 绑定进度条事件
    const progressBar = document.getElementById('progressBar');
    progressBar.addEventListener('input', function() {
        const seekTime = (audioPlayer.duration / 100) * this.value;
        audioPlayer.currentTime = seekTime;
    });

    // 监听音频时间更新
    audioPlayer.addEventListener('timeupdate', updateProgress);

    // 监听音频结束
    audioPlayer.addEventListener('ended', function() {
        if (isLooping) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            nextTrack();
        }
    });

    // 监听音频加载完成
    audioPlayer.addEventListener('loadedmetadata', function() {
        document.getElementById('totalTime').textContent = formatTime(audioPlayer.duration);
    });

    // 定期保存播放状态（每秒保存，减少跳转时的进度丢失）
    setInterval(saveMusicState, 1000);

    // 页面卸载前保存状态
    window.addEventListener('beforeunload', saveMusicState);
}

function renderPlaylist() {
    const container = document.getElementById('playlistContainer');
    container.innerHTML = '';

    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) {
            item.classList.add('active');
        }
        item.innerHTML = `<span>${index + 1}. ${track.title} - ${track.artist}</span>`;
        item.onclick = () => loadTrack(index);
        container.appendChild(item);
    });
}

function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    currentTrackIndex = index;
    const track = playlist[index];

    audioPlayer.src = track.src;
    document.getElementById('musicTitle').textContent = track.title;
    document.getElementById('musicArtist').textContent = track.artist;
    document.getElementById('musicCover').src = track.cover;

    renderPlaylist();

    // 自动播放
    audioPlayer.play().catch(err => {
        console.log('自动播放被阻止:', err);
    });

    updatePlayButton(true);
    saveMusicState();
}

function togglePlay() {
    if (audioPlayer.paused) {
        if (!audioPlayer.src) {
            loadTrack(0);
        } else {
            audioPlayer.play();
        }
        updatePlayButton(true);
    } else {
        audioPlayer.pause();
        updatePlayButton(false);
    }
    saveMusicState();
}

function updatePlayButton(isPlaying) {
    const playBtn = document.getElementById('playBtn');
    if (isPlaying) {
        playBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
        `;
    } else {
        playBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        `;
    }
}

function previousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
}

function nextTrack() {
    if (isShuffling) {
        // 随机选择下一首（不重复当前歌曲）
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentTrackIndex && playlist.length > 1);
        currentTrackIndex = nextIndex;
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
}

function toggleLoop() {
    isLooping = !isLooping;

    if (isLooping) {
        // 开启循环，关闭随机
        isShuffling = false;
    }

    updateLoopButton();
    updateShuffleButton();
    saveMusicState();
}

function toggleShuffle() {
    isShuffling = !isShuffling;

    if (isShuffling) {
        // 开启随机，关闭循环
        isLooping = false;
    }

    updateShuffleButton();
    updateLoopButton();
    saveMusicState();
}

function updateLoopButton() {
    const loopBtn = document.getElementById('loopBtn');
    loopBtn.style.color = isLooping ? '#FF6B9D' : 'rgba(255, 255, 255, 0.85)';
    loopBtn.style.transform = isLooping ? 'scale(1.1)' : 'scale(1)';
}

function updateShuffleButton() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.style.color = isShuffling ? '#FF6B9D' : 'rgba(255, 255, 255, 0.85)';
    shuffleBtn.style.transform = isShuffling ? 'scale(1.1)' : 'scale(1)';
}

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const currentTime = document.getElementById('currentTime');

    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress || 0;
    currentTime.textContent = formatTime(audioPlayer.currentTime);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleMusicPlayer() {
    const player = document.getElementById('musicPlayer');
    player.classList.toggle('show');
    saveMusicState(); // 保存播放器显示状态
}
