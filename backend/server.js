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

// 上传文件存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);  
    const base = path.basename(file.originalname, ext); 
    cb(null, `${base}-${Date.now()}${ext}`); 
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  // 调用 Python 脚本解析 GP 文件
  const py = spawn('python3', [path.join(__dirname, 'utils/gp_parser.py'), filePath]);

  let pyOutput = '';
  let pyError = '';

  py.stdout.on('data', chunk => pyOutput += chunk.toString());
  py.stderr.on('data', chunk => pyError += chunk.toString());

  py.on('close', (code) => {
    if (code === 0 && pyOutput) {
      try {
        const pyResult = JSON.parse(pyOutput);

        if (pyResult.json_path) {
          // 读取 Python 生成的 JSON 文件
          fs.readFile(pyResult.json_path, 'utf-8', (err, fileData) => {
            if (err) {
              res.status(500).json({ error: 'Failed to read generated JSON', details: err.message });
              return;
            }

            try {
              const parsedData = JSON.parse(fileData);
              res.json(parsedData); // 返回给前端
            } catch (e) {
              res.status(500).json({ error: 'Failed to parse JSON file', details: e.message });
            }
          });
        } else {
          res.status(500).json({ error: 'Python script did not return json_path' });
        }
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse Python output', details: e.message });
      }
    } else {
      res.status(500).json({ error: 'Python script failed', details: pyError || pyOutput });
    }
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
