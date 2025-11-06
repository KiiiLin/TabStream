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

// 上传文件目录配置
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

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  console.log('Uploaded GP file:', filePath);

  // 调用 Python 多轨解析
  const py = spawn('python3', [
    path.join(__dirname, 'utils/gp_parser.py'),
    filePath
  ]);

  let pyChunks = [];   // ✅ 防止 JSON 被拆段
  let pyError = '';

  py.stdout.on('data', chunk => pyChunks.push(chunk));
  py.stderr.on('data', chunk => pyError += chunk.toString());

  py.on('close', (code) => {
    // ✅ 合并所有输出，保证 JSON 完整性
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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
