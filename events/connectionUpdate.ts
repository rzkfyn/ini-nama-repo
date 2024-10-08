import { WASocket, ConnectionState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { EventEmitter } from 'events';


export default {
  name: 'connection.update',
  execute: async (update: Partial<ConnectionState>, { sock, start }: {
    sock: WASocket, start: () => Promise<void>
  }) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect);
      if (shouldReconnect) start();
    }
  }
}
