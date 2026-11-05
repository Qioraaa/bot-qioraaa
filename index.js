const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Buat folder uploads jika belum ada
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Buka Akses Publik ke Folder Uploads agar Video Bisa Diputar Langsung
app.use('/uploads', express.static(uploadDir));

// 3. Konfigurasi Multer (Menjaga Format, Ekstensi & Kualitas Asli Tanpa Kompresi)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Limit file dinaikkan hingga 2GB per file tanpa kompresi
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
});

// Database ID Sementara (Menyimpan Custom Owner ID secara default)
const validAccessIds = new Set(['QIORAAA-OWNER']);

// Token Bot & Konfigurasi Owner
