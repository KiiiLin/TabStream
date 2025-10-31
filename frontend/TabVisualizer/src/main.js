import './style.css';

const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');

// 点击上传框 → 触发文件选择
uploadBox.addEventListener('click', () => {
  fileInput.click();
});

// 拖拽进入
uploadBox.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

// 拖拽离开
uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

// 放下文件时
uploadBox.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file && (file.name.endsWith('.gp') || file.name.endsWith('.gp3') || file.name.endsWith('.gp4') || file.name.endsWith('.gp5'))) {
    uploadFile(file); 
  } else {
    fileName.textContent = '仅支持 .gp / .gp3 / .gp4 / .gp5 文件';
  }
});

// 文件选择后上传
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) uploadFile(file); 
});

// 上传函数
function uploadFile(file) {
  fileName.textContent = `上传中：${file.name}`;

  // 显示进度条
  progressContainer.style.display = 'block';
  progressBar.value = 0;
  progressText.textContent = '0%';

  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/upload', true);

  // 上传进度事件
  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      progressBar.value = percent;
      progressText.textContent = `${percent.toFixed(0)}%`;
    }
  };

  // 上传完成
  xhr.onload = () => {
    if (xhr.status === 200) {
      progressBar.classList.add('succeed');
      fileName.textContent = `上传成功：${file.name}`;
    } else {
      showError('上传失败');
    }
  };

  xhr.onerror = () => {
    showError('上传失败');
  };

  xhr.send(formData);
}

// 上传成功后淡出进度条
function fadeOutProgress() {
  setTimeout(() => {
    progressContainer.style.transition = 'opacity 1s ease';
    progressContainer.style.opacity = '0';
    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressContainer.style.transition = ''; 
    }, 1000);
  }, 2000); 
}

// 上传失败显示红色进度条
function showError(message) {
  fileName.textContent = message;
  progressBar.classList.add('error');
  setTimeout(fadeOutProgress, 3000);
}
