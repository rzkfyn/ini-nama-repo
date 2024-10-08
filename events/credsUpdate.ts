import { AuthenticationCreds } from '@whiskeysockets/baileys';

export default {
  name: 'creds.update',
  execute: async (_: Partial<AuthenticationCreds>, { saveCreds }: {
    saveCreds: () => Promise<void>
  }) => {
    return saveCreds();
  }
};
