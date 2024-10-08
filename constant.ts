import 'dotenv/config';

export default {
  rootFolder: process.env.NODE_ENV === 'PROD' ? './lib' : '.',
};
