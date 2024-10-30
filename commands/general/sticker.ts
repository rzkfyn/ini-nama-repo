import { WASocket, proto, downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, _: string[]) => {
  if (!message?.message?.imageMessage && !message?.message?.videoMessage) return await sock.sendMessage(message.key.remoteJid as string, { text: 'Lampirkan gambar untuk diubah menjadi sticker!' }, { quoted: message });

  try {
    console.log('masuk sini');
    
    const mediaKey = message?.message?.videoMessage ? message?.message?.videoMessage?.mediaKey : message?.message?.imageMessage?.mediaKey;
    const mediaBuffer = await downloadMediaMessage(message, 'buffer', { options: { } });
    console.log('masuk sini selesai');
    console.log(mediaBuffer);
    let webpBuffer: Buffer;
    if (message?.message?.imageMessage) {
      webpBuffer = await sharp(mediaBuffer)
        .toFormat('webp')
        .resize({ width: 512, height: 512 })
        .toBuffer();
      return sock.sendMessage(message.key.remoteJid as string, { sticker: webpBuffer as Buffer }, { quoted: message });
    }
    const now = + Date.now();
    const inputFileName = `input_${now}.mp4`;
    const outputFileName = `output_${now}.mp4`;
    fs.writeFileSync(inputFileName, mediaBuffer);
    ffmpeg(inputFileName)
      .output(outputFileName)
      .videoFilters('scale=512:512')
      .on('end', async () => {
        const stickerBuffer = fs.readFileSync(outputFileName);
        fs.rmSync(inputFileName);
        fs.rmSync(outputFileName);
        return await sock.sendMessage(message.key.remoteJid as string, { sticker: stickerBuffer });
      })
      .on('error', (err) => {
        throw err;
      })
      .run();
  } catch(e) {
    console.error(e);

    return await sock.sendMessage(message.key.remoteJid as string, { text: `Gagal mengubah gambar menjadi sticker ;_;. Error: ${e}` });
  }
};
