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

// 2. Akses Publik Folder Uploads (Video Player direct stream)
app.use('/uploads', express.static(uploadDir));

// 3. Konfigurasi Multer (Kualitas Asli 100% Tanpa Kompresi)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // Max 2GB
});

// Database ID Akses
const validAccessIds = new Set(['QIORAAA-OWNER']);

// Token Bot & Konfigurasi Telegram
const token = '9172990010:AAG1fgI_sras7A-R2fILadmX_OKI9kxENRk';
const bot = new TelegramBot(token, { polling: true });

const REQUIRED_GROUP = '@qioraaa_community';
const ADMIN_TELEGRAM_ID = 7101495433;
const ADMIN_CUSTOM_ID = 'QIORAAA-OWNER';

function generateAccessID() {
  return 'QIORAAA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// --- LOGIKA BOT TELEGRAM ---
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const member = await bot.getChatMember(REQUIRED_GROUP, userId);
    const validStatuses = ['creator', 'administrator', 'member'];

    if (validStatuses.includes(member.status)) {
      let accessId;
      let badge = '';

      if (userId === ADMIN_TELEGRAM_ID) {
        accessId = ADMIN_CUSTOM_ID;
        badge = ' 👑 *(Owner Access)*';
      } else {
        accessId = generateAccessID();
      }

      validAccessIds.add(accessId);

      bot.sendMessage(
        chatId,
        `✅ **Akses Diterima!**${badge}\n\nTerima kasih sudah bergabung di grup.\n🔑 **ID Akses Anda:** \`${accessId}\` \n\nGunakan ID ini untuk akses Website Upload!`,
        { parse_mode: 'Markdown' }
      );
    } else {
      bot.sendMessage(
        chatId,
        `⚠️ **Akses Ditolak!**\n\nKamu harus bergabung ke grup ${REQUIRED_GROUP} terlebih dahulu untuk mendapatkan ID Akses.`
      );
    }
  } catch (error) {
    bot.sendMessage(
      chatId,
      `⚠️ **Akses Ditolak!**\n\nSilakan bergabung ke grup ${REQUIRED_GROUP} terlebih dahulu untuk menggunakan bot ini.`
    );
  }
});

// --- WEBSITE UPLOAD (UI + VIDEO PLAYER) ---
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Qioraaa Original Media Upload</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0d0e12; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #16181e; padding: 30px; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.6); width: 100%; max-width: 450px; border: 1px solid #282c37; text-align: center; }
        h2 { margin-bottom: 6px; color: #0088cc; }
        p.sub { font-size: 13px; color: #8a8d9b; margin-bottom: 24px; }
        input[type="text"], input[type="file"] { width: 100%; padding: 12px; margin: 8px 0 16px; border-radius: 8px; border: 1px solid #2a2e3d; background: #0f1015; color: #fff; }
        button { width: 100%; padding: 14px; border: none; border-radius: 8px; background: #0088cc; color: white; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button:hover { background: #0077b5; }
        #status { margin-top: 15px; font-size: 14px; word-break: break-all; }
        video { width: 100%; max-height: 250px; border-radius: 10px; margin-top: 15px; background: #000; outline: none; border: 1px solid #333; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Qioraaa Upload Hub</h2>
        <p class="sub">100% Uncompressed File & Playable Player</p>

        <form id="uploadForm" enctype="multipart/form-data">
          <input type="text" id="accessId" name="accessId" placeholder="Masukkan ID Akses (QIORAAA-...)" required>
          <input type="file" id="fileInput" name="file" accept="video/*,image/*" required>
          <button type="submit">Upload High Quality File</button>
        </form>

        <div id="status"></div>
        <div id="previewArea"></div>
      </div>

      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const statusDiv = document.getElementById('status');
          const previewArea = document.getElementById('previewArea');
          
          statusDiv.style.color = '#e0e0e0';
          statusDiv.innerText
