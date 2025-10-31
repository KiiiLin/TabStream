import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());

// 指定上传文件夹
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send({ success: true, filename: req.file.filename });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
