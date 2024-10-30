import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import 'dotenv/config';
import { readdirSync } from 'fs';
import constant from './constant';

const events = readdirSync(`${constant.rootFolder}/events`).filter((file) => file.endsWith(process.env.NODE_ENV === 'PROD' ? '.js' : '.js'));
const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('__ignore__creds');
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state
  });

  events.forEach(async (event) => {
    const { default: ev } = await import(`./events/${event}`);
    const { name, execute } = ev;

    sock.ev.on(name, (...args) => execute(...args, { sock, start, saveCreds }))
  });
};

start();
