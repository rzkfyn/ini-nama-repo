import { WASocket, proto } from '@whiskeysockets/baileys';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, _: string[]) => {
  const helpText = `
    Berikut adalah daftar perintah yang tersedia:

    - *!dlmanga*: Mengunduh manga dalam bahasa Indonesia dari situs Westmanga dalam format PDF.
    - *!decode*: Mengonversi teks menjadi base64 dengan format UTF-8.
    - *!encode*: Mengonversi base64 UTF-8 menjadi teks biasa.
    - *!sticker*: Mengubah gambar menjadi stiker.

    Gunakan perintah sesuai kebutuhan Anda. Terima kasih.
`;
  return await sock.sendMessage(message.key.remoteJid as string, { text: helpText }, { quoted: message } );
};
