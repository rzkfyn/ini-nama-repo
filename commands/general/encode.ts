import { WASocket, proto } from '@whiskeysockets/baileys';
import fs from 'fs/promises';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, args: string[]) => {
  if (!args[0] &&  !message?.message?.imageMessage) return;
  
  const encoded = Buffer.from(args.join(' ')).toString('base64');
  return await sock.sendMessage(message.key.remoteJid as string, { text: encoded });
};
