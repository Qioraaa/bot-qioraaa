const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Express server untuk menjaga bot tetap online
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot Qioraaa HD is Running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Token Bot Telegram dari BotFather
const token = '9172990010:AAG1fgI_sras7A-R2fILadmX_OKI9kxENRk';
const bot = new TelegramBot(token, { polling: true });

// Username grup Telegram yang diwajibkan
const REQUIRED_GROUP = '@qioraaa_community';

// ID Telegram kamu & Custom ID khusus untuk Owner
const ADMIN_TELEGRAM_ID = 7101495433;
const ADMIN_CUSTOM_ID = 'QIORAAA-OWNER'; // Ganti tulisan ini jika mau teks lain

// Fungsi generate ID Akses Unik untuk member
function generateAccessID() {
  return 'QIORAAA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const member = await bot.getChatMember(REQUIRED_GROUP, userId);
    const validStatuses = ['creator', 'administrator', 'member'];

    if (validStatuses.includes(member.status)) {
      let accessId;
      let badge = '';

      // Cek apakah yang nge-chat adalah Kamu (Owner)
      if (userId === ADMIN_TELEGRAM_ID) {
        accessId = ADMIN_CUSTOM_ID;
        badge = ' 👑 *(Owner Access)*';
      } else {
        accessId = generateAccessID();
      }

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
