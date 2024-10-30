import { WASocket, proto } from '@whiskeysockets/baileys';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, _: string[]) => {
  return await sock.sendMessage(message.key.remoteJid as string, { text: 'Bacot Kont' }, { quoted: message } );
};
