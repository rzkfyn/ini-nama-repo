import { MessageUpsertType, proto, WASocket } from '@whiskeysockets/baileys';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import constant from '../constant';

const { PREFIX: prefix } = process.env;
const commandFolders = readdirSync(resolve(`${constant.rootFolder}/commands`));
const commandFiles: {
  file: string,
  folder: string
}[] = [] ;

commandFolders.forEach((folder) => {
  if(folder.endsWith('.DS_Store')) return;
  const files = readdirSync(resolve(`${constant.rootFolder}/commands`, folder));

  files.forEach((file) => {
    if(file.endsWith(process.env.NODE_ENV === 'PROD' ? '.js' : '.ts')) {
      commandFiles.push({ file, folder });
    }
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
        const { execute } = await import(resolve(`${constant.rootFolder}/commands`, folder, file));
        return await execute(sock, message, args);
      }
    })
  }
};