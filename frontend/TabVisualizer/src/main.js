import './style.css';
import { renderGuitarTab } from './render.js';

const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressContainer = document.getElementById('progressContainer');

uploadBox.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('dragover', e => { e.preventDefault(); uploadBox.classList.add('dragover'); });
uploadBox.addEventListener('dragleave', () => uploadBox.classList.remove('dragover'));
uploadBox.addEventListener('drop', e => { e.preventDefault(); uploadBox.classList.remove('dragover'); handleFile(e.dataTransfer.files[0]); });
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

function handleFile(file){
    if(!file) return;
    if(!/\.gp[3-5]?$/i.test(file.name)) return showError('仅支持 .gp / .gp3 / .gp4 / .gp5 文件');
    uploadFile(file);
}

function uploadFile(file){
    fileName.textContent = `上传中：${file.name}`;
    progressContainer.style.display = 'block';
    progressBar.value = 0;
    progressText.textContent = '0%';
    progressBar.classList.remove('error','succeed');

    const formData = new FormData();
    formData.append('file', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST','http://localhost:3000/upload',true);

    xhr.upload.onprogress = e => {
        if(e.lengthComputable){
            const percent = (e.loaded / e.total) * 100;
            progressBar.value = percent;
            progressText.textContent = `${percent.toFixed(0)}%`;
        }
    };

    xhr.onload = () => {
        if(xhr.status===200){
            let jsonData;
            try{ jsonData = JSON.parse(xhr.responseText); } catch(e){ return showError('JSON 解析失败'); }
            if(jsonData.error) return showError(jsonData.error);
            
            renderGuitarTab(jsonData);

            progressBar.classList.add('succeed');
            fileName.textContent = `上传成功：${file.name}`;
            fadeOutProgressAndText();
        } else showError('上传失败');
    };

    xhr.onerror = () => showError('上传失败');
    xhr.send(formData);
}

function fadeOutProgressAndText(){
    setTimeout(()=>{
        progressContainer.style.transition='opacity 1s';
        fileName.style.transition='opacity 1s';
        progressContainer.style.opacity='0';
        fileName.style.opacity='0';
        setTimeout(()=>{
            progressContainer.style.display='none';
            fileName.style.display='none';
            progressContainer.style.transition='';
            fileName.style.transition='';
        },1000);
    },2000);
}

function showError(msg){
    fileName.textContent = msg;
    progressBar.classList.add('error');
    fadeOutProgressAndText();
}
