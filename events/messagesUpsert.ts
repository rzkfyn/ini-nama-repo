import { MessageUpsertType, proto, WASocket } from '@whiskeysockets/baileys';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const { PREFIX: prefix } = process.env;
const commandFolders = readdirSync(resolve('commands'));
const commandFiles: {
  file: string,
  folder: string
}[] = [] ;

commandFolders.forEach((folder) => {
  if(folder.endsWith('.DS_Store')) return;
  const files = readdirSync(resolve('commands', folder));

  files.forEach((file) => {
    commandFiles.push({ file, folder });
  });
});

export default {
  name: 'messages.upsert',
  execute: (m: {
    messages: proto.IWebMessageInfo[],
    type: MessageUpsertType
  }, { sock }: {
    sock: WASocket
  }) => {
    const { messages } = m;
    const message = messages[0];    
    const text = message.message?.extendedTextMessage?.text ?? message.message?.conversation;

    if (!text?.startsWith(prefix as string)) return;

    const args = text?.slice((prefix as string).length).trim().split(/ /g);
    const command = args?.shift()?.toLowerCase();

    if (!command) return;

    commandFiles.forEach(async ({ file, folder }) => {
      if (file.startsWith(command)) {
        const { execute } = await import(resolve('commands', folder, file));
        return await execute(sock, message, args);
      }
    })
  }
};