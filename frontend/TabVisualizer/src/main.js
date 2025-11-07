import './style.css';
import { renderGuitarTab } from './render.js';

const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');
const trackList = document.getElementById('trackList');

// -------------------- 上传事件 --------------------
uploadBox.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('dragover', e => { 
    e.preventDefault(); 
    uploadBox.classList.add('dragover'); 
});
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', e => { 
    e.preventDefault(); 
    uploadBox.classList.remove('dragover'); 
    handleFile(e.dataTransfer.files[0]); 
});
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

// -------------------- 文件处理 --------------------
function handleFile(file) {
    if (!file) return;

    if (!/\.gp(3|4|5|x)?$/i.test(file.name)) {
        return showError('仅支持 .gp / .gpx / .gp3 / .gp4 / .gp5 文件');
    }

    uploadFile(file);
}

function uploadFile(file) {
    resetUploadUI();

    fileName.textContent = `上传中：${file.name}`;
    progressContainer.style.display = 'block';
    progressBar.value = 0;
    progressText.textContent = '0%';

    const formData = new FormData();
    formData.append('file', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/upload', true);

    xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            progressBar.value = percent;
            progressText.textContent = `${percent.toFixed(0)}%`;
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            let jsonData;
            try { 
                jsonData = JSON.parse(xhr.responseText); 
            } catch (e) { 
                return showError('JSON 解析失败'); 
            }

            if (jsonData.error) return showError(jsonData.error);
            if (!jsonData.tracks || jsonData.tracks.length === 0) {
                return showError('没有可用的轨道');
            }

            setupTrackSelector(jsonData.tracks);

            progressBar.classList.add('succeed');
            fileName.textContent = `上传成功：${file.name}`;

            fadeOutUploadUI();

        } else {
            showError('上传失败');
        }
    };

    xhr.onerror = () => showError('上传失败');
    xhr.send(formData);
}

// -------------------- 构建轨道按钮 --------------------
function setupTrackSelector(trackListData) {
    trackList.innerHTML = '';  // 清空旧轨道
    trackList.style.display = 'flex';  // 保证显示

    trackListData.forEach((track, index) => {
        const btn = document.createElement('button');
        btn.className = 'track-btn';
        btn.textContent = track.name || `轨道 ${index + 1}`;
        btn.onclick = () => renderGuitarTab(track.vextab);
        trackList.appendChild(btn);
    });

    // 默认渲染第一轨
    renderGuitarTab(trackListData[0].vextab);
}

// -------------------- UI 辅助 --------------------
function fadeOut(element, duration = 1000) {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';
    setTimeout(() => element.style.display = 'none', duration);
}

function fadeIn(element) {
    element.style.display = 'block';
    element.style.opacity = '1';
    element.style.transition = '';
}

function fadeOutUploadUI() {
    fadeOut(uploadBox);
    fadeOut(progressContainer);
    fadeOut(fileName);
}

function resetUploadUI() {
    fadeIn(uploadBox);
    fadeIn(progressContainer);
    fadeIn(fileName);
    progressBar.classList.remove('error','succeed');
    progressBar.value = 0;
    progressText.textContent = '0%';
}

// -------------------- 错误显示 --------------------
function showError(msg) {
    fileName.textContent = msg;
    progressBar.classList.add('error');
    resetUploadUI(); // 保留上传框允许重试
}
