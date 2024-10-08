import { WASocket, proto } from '@whiskeysockets/baileys';
import fs from 'fs';
import { downloadPdf } from '../../helper/westMangaDownload';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, args: string[]) => {
  if (!args[0]) return;

  const url = args[0];
  const sentMessage = await sock.sendMessage(message.key.remoteJid as string, { text: 'Tunggu beberapa saat...' }, { quoted: message } );
  
  const pdf = await downloadPdf(url);
  if (pdf) {
    if (sentMessage?.key) await sock.sendMessage(message.key.remoteJid as string, { delete: sentMessage.key } );
    await sock.sendMessage(message.key.remoteJid as string, { document: { url: pdf }, fileName: pdf.split('/').pop() ?? '', mimetype: 'application/pdf' }, { quoted: message });
    fs.rmSync(pdf, { recursive: true, force: true });
    return;
  }
  return await sock.sendMessage(message.key.remoteJid as string, { text: 'Gagal mengunduh pdf!' }, { quoted: message } );
};
