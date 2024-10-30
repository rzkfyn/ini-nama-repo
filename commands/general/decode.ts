import { WASocket, proto } from '@whiskeysockets/baileys';

export const execute = async (sock: WASocket, message: proto.IWebMessageInfo, args: string[]) => {
  if (!args[0]) return;

  const decoded = Buffer.from(args.join(' '), 'base64').toString('ascii');
  return await sock.sendMessage(message.key.remoteJid as string, { text: decoded });
};
