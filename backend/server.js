import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供 covers 和 memories 的文件夹内容
app.use('/api/covers', express.static(path.join(__dirname, 'covers')));
app.use('/api/memories', express.static(path.join(__dirname, 'memories')));

// 上传目录
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// 用于上传 covers 和 memories 的 multer 配置
const mediaUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB 限制
});

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const ext = path.extname(filePath).toLowerCase();
  console.log('Uploaded file:', filePath);

  // ✅ 自动判断使用哪个解析脚本
  let parserScript;
  if (['.gp3', '.gp4', '.gp5'].includes(ext)) {
    parserScript = path.join(__dirname, 'utils/gp_parser.py');
  } else if (['.gpx', '.gp'].includes(ext)) {
    parserScript = path.join(__dirname, 'utils/gpx_parser.py');
  } else {
    return res.status(400).json({ error: `Unsupported file type: ${ext}` });
  }

  console.log(`Using parser: ${path.basename(parserScript)}`);

  // 调用对应的 Python 脚本
  const py = spawn('python3', [parserScript, filePath]);

  let pyChunks = [];
  let pyError = '';

  py.stdout.on('data', chunk => pyChunks.push(chunk));
  py.stderr.on('data', chunk => pyError += chunk.toString());

  py.on('close', (code) => {
    const pyOutput = Buffer.concat(pyChunks).toString();

    if (code !== 0) {
      return res.status(500).json({
        error: 'Python script failed',
        details: pyError || pyOutput
      });
    }

    let resultJson;
    try {
      resultJson = JSON.parse(pyOutput);
    } catch (err) {
      return res.status(500).json({
        error: 'Failed to parse JSON from Python',
        details: err.message,
        raw: pyOutput
      });
    }

    if (!resultJson.tracks || !Array.isArray(resultJson.tracks)) {
      return res.status(500).json({ error: 'Invalid Python output: tracks missing' });
    }

    let pending = resultJson.tracks.length;
    const tracksResult = [];

    if (pending === 0) {
      return res.json({ tracks: [] });
    }

    resultJson.tracks.forEach(track => {
      const vextabPath = track.vextab_path;

      fs.readFile(vextabPath, 'utf-8', (err, content) => {
        if (err) {
          tracksResult.push({
            name: track.track_name,
            vextab: null,
            error: `Failed to read file: ${vextabPath}`
          });
        } else {
          tracksResult.push({
            name: track.track_name,
            vextab: content
          });
        }

        pending--;
        if (pending === 0) {
          res.json({ tracks: tracksResult });
        }
      });
    });
  });
});

// API: 获取 Covers 数据 - 扫描按日期+时间戳命名的子文件夹
app.get('/api/covers', (req, res) => {
  const coversDir = path.join(__dirname, 'covers');
  
  try {
    const entries = fs.readdirSync(coversDir, { withFileTypes: true });
    
    // 筛选出文件夹（按日期+时间戳命名格式：YYYYMMDD-HHMMSS-timestamp）
    const folders = entries
      .filter(entry => entry.isDirectory() && /^\d{8}-\d{6}-\d+$/.test(entry.name))
      .sort()
      .reverse(); // 最新的在前（按文件夹名称排序）
    
    const covers = [];
    
    folders.forEach((folder) => {
      const folderPath = path.join(coversDir, folder.name);
      
      try {
        // 查找JSON文件
        const jsonFiles = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.json'))
          .sort()
          .reverse();
        
        if (jsonFiles.length > 0) {
          const jsonPath = path.join(folderPath, jsonFiles[0]);
          const jsonData = fs.readFileSync(jsonPath, 'utf-8');
          const coverData = JSON.parse(jsonData);
          
          // 查找文件夹中的视频和图片文件
          const files = fs.readdirSync(folderPath);
          const videoFile = files.find(f => /\.(mp4|avi|mov|webm|mkv)$/i.test(f));
          const thumbnailFile = files.find(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f) && !f.endsWith('.json'));
          
          // 构建URL路径，并保存文件夹名用于删除
          if (videoFile) {
            coverData.videoUrl = `/api/covers/${folder.name}/${videoFile}`;
          }
          if (thumbnailFile) {
            coverData.thumbnail = `/api/covers/${folder.name}/${thumbnailFile}`;
          }
          coverData.folderName = folder.name; // 保存文件夹名用于删除
          
          covers.push(coverData);
        }
      } catch (err) {
        console.error(`Error processing folder ${folder.name}:`, err);
      }
    });
    
    res.json({ covers });
  } catch (err) {
    console.error('Error reading covers directory:', err);
    res.status(500).json({ error: 'Failed to read covers directory' });
  }
});

// API: 获取 Memories 数据 - 扫描按日期+时间戳命名的子文件夹
app.get('/api/memories', (req, res) => {
  const memoriesDir = path.join(__dirname, 'memories');
  
  try {
    const entries = fs.readdirSync(memoriesDir, { withFileTypes: true });
    
    // 筛选出文件夹（按日期+时间戳命名格式：YYYYMMDD-HHMMSS-timestamp）
    const folders = entries
      .filter(entry => entry.isDirectory() && /^\d{8}-\d{6}-\d+$/.test(entry.name))
      .sort()
      .reverse(); // 最新的在前（按文件夹名称排序）
    
    const memories = [];
    
    folders.forEach((folder) => {
      const folderPath = path.join(memoriesDir, folder.name);
      
      try {
        // 查找JSON文件
        const jsonFiles = fs.readdirSync(folderPath)
          .filter(file => file.endsWith('.json'))
          .sort()
          .reverse();
        
        if (jsonFiles.length > 0) {
          const jsonPath = path.join(folderPath, jsonFiles[0]);
          const jsonData = fs.readFileSync(jsonPath, 'utf-8');
          const memoryData = JSON.parse(jsonData);
          
          // 查找文件夹中的图片文件
          const files = fs.readdirSync(folderPath);
          const imageFile = files.find(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f) && !f.endsWith('.json'));
          
          // 构建URL路径，并保存文件夹名用于删除
          if (imageFile) {
            memoryData.image = `/api/memories/${folder.name}/${imageFile}`;
          }
          memoryData.folderName = folder.name; // 保存文件夹名用于删除
          
          memories.push(memoryData);
        }
      } catch (err) {
        console.error(`Error processing folder ${folder.name}:`, err);
      }
    });
    
    res.json({ memories });
  } catch (err) {
    console.error('Error reading memories directory:', err);
    res.status(500).json({ error: 'Failed to read memories directory' });
  }
});

// API: 上传 Covers 文件
app.post('/api/covers/upload', mediaUpload.array('files'), (req, res) => {
  try {
    const { folderName } = req.body;
    const files = req.files;

    if (!folderName || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing folderName or files' });
    }

    const folderPath = path.join(__dirname, 'covers', folderName);
    
    // 创建文件夹
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 生成日期+时间戳格式的文件名
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const timestamp = Date.now();

    let videoFile = null;
    let thumbnailFile = null;
    
    // 解析标签
    let tags = [];
    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (e) {
        tags = [];
      }
    }
    
    const jsonData = {
      id: parseInt(timestamp.toString().slice(-6)) || 1,
      songName: req.body.songName || '新视频',
      artist: req.body.artist || '',
      cover: req.body.cover || '',
      description: req.body.description || '',
      tags: tags
    };

    // 保存文件
    files.forEach((file, index) => {
      const ext = path.extname(file.originalname);
      const isVideo = /\.(mp4|avi|mov|webm|mkv)$/i.test(ext);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext);

      let filename;
      const fileTimestamp = timestamp + index; // 为每个文件添加索引避免重名
      if (isVideo) {
        filename = `${dateStr}-${timeStr}-${fileTimestamp}${ext}`;
        videoFile = filename;
      } else if (isImage) {
        filename = `${dateStr}-${timeStr}-${fileTimestamp}${ext}`;
        thumbnailFile = filename;
      } else {
        filename = file.originalname;
      }

      const filePath = path.join(folderPath, filename);
      fs.writeFileSync(filePath, file.buffer);
    });

    // 保存 JSON 文件
    const jsonFilename = `${dateStr}-${timeStr}-${timestamp}.json`;
    const jsonPath = path.join(folderPath, jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    res.json({ 
      success: true, 
      folderName,
      message: 'Files uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload files', details: err.message });
  }
});

// API: 删除 Covers 文件夹
app.delete('/api/covers/delete/:folderName', (req, res) => {
  try {
    const { folderName } = req.params;
    const folderPath = path.join(__dirname, 'covers', folderName);

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // 删除文件夹及其内容
    fs.rmSync(folderPath, { recursive: true, force: true });

    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete folder', details: err.message });
  }
});

// API: 上传 Memories 文件
app.post('/api/memories/upload', mediaUpload.array('files'), (req, res) => {
  try {
    const { folderName } = req.body;
    const files = req.files;

    if (!folderName || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing folderName or files' });
    }

    const folderPath = path.join(__dirname, 'memories', folderName);
    
    // 创建文件夹
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 生成日期+时间戳格式的文件名
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const timestamp = Date.now();

    let imageFile = null;
    const jsonData = {
      id: parseInt(timestamp.toString().slice(-6)) || 1,
      date: req.body.date || now.toISOString().slice(0, 10),
      description: req.body.description || '',
      detailedDescription: req.body.detailedDescription || req.body.description || ''
    };

    // 保存文件
    files.forEach((file) => {
      const ext = path.extname(file.originalname);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(ext);

      if (isImage && !imageFile) {
        const filename = `${dateStr}-${timeStr}-${timestamp}${ext}`;
        imageFile = filename;
        const filePath = path.join(folderPath, filename);
        fs.writeFileSync(filePath, file.buffer);
      }
    });

    // 保存 JSON 文件
    const jsonFilename = `${dateStr}-${timeStr}-${timestamp}.json`;
    const jsonPath = path.join(folderPath, jsonFilename);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

    res.json({ 
      success: true, 
      folderName,
      message: 'Files uploaded successfully'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload files', details: err.message });
  }
});

// API: 删除 Memories 文件夹
app.delete('/api/memories/delete/:folderName', (req, res) => {
  try {
    const { folderName } = req.params;
    const folderPath = path.join(__dirname, 'memories', folderName);

    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // 删除文件夹及其内容
    fs.rmSync(folderPath, { recursive: true, force: true });

    res.json({ success: true, message: 'Folder deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete folder', details: err.message });
  }
});

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
