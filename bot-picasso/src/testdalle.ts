import dotenv from 'dotenv';

dotenv.config({
  path:
    __dirname +
    '/../.env' +
    (process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''),
});

import * as dalle from './lib/openai-dall-e';
import * as tppt from './lib/tppt-api';

const avatarUrl =
  'https://cdn.discordapp.com/avatars/169141120339673088/c7b1c0635e581bb6d4ed30fb3176071b.webp?size=80';

const questTitle = 'Boire le café';
const questDescription = 'Quete répetable, qui consiste à boire un café';
const prompt = `imagine un personnage de jeu rpg en style pixel-art vue top-down, qui est en train d'accomplir la quête intitulée [${questTitle}]`;

(async () => {
  try {
    const text = await dalle.getDallEImage(prompt);
    console.log(text);
    const tppturl = await tppt.dalle2tppt(text);
    console.log(tppturl);
  } catch (e) {
    // Deal with the fact the chain failed
    console.error(e);
  }
  // `text` is not available here
})();

export {};
