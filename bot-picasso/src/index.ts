//typescript imports
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { default as logger } from './logger';

//load environment variables

dotenv.config({
  path:
    __dirname +
    '/../.env' +
    (process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''),
});

const basePath = __dirname;

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { BotApplication } from './types/BotApplication';

//parsing env variables
const BOT_INVISIBLE = process.env.BOT_INVISIBLE === 'true';
const BOT_TOKEN = process.env.BOT_TOKEN || false;
const BOT_VERSION = process.env.BOT_VERSION || false;
const DATA_PATH = process.env.DATA_PATH || 'data';
const API_URL = process.env.API_URL || false;
const USE_DALLE = process.env.USE_DALLE === 'true';

//test bot token is set
if (!BOT_TOKEN) {
  logger.fatal('BOT_TOKEN environment variable not set');
  process.exit(1);
}

//test bot version is set
if (!BOT_VERSION) {
  logger.fatal('BOT_VERSION environment variable not set');
  process.exit(1);
}

//test data path is set
if (!DATA_PATH) {
  logger.fatal('DATA_PATH environment variable not set');
  process.exit(1);
}

//test api url is set
if (!API_URL) {
  logger.fatal('API_URL environment variable not set');
  process.exit(1);
}

//test data path exists
if (!fs.existsSync(DATA_PATH)) {
  logger.fatal(`DATA_PATH ${DATA_PATH} doesn't exist`);
  process.exit(1);
}

//test data path is writable
try {
  const testFile = `${DATA_PATH}/.writetest`;
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
} catch (err) {
  logger.fatal(`DATA_PATH ${DATA_PATH} is not writable`);
  process.exit(1);
}

//check if bot was updated
let updated: boolean = false;
let botVersion: string = '';
const botVersionFile = `${DATA_PATH}/.version`;

//check version file if exists
if (fs.existsSync(botVersionFile)) {
  //read version file
  try {
    botVersion = fs.readFileSync(botVersionFile, 'utf8');
  } catch (err) {
    logger.fatal("Can't read the bot .version file");
    process.exit(1);
  }
}

//check if bot was updated
if (botVersion !== BOT_VERSION) {
  updated = true;
  try {
    //write new version
    fs.writeFileSync(botVersionFile, BOT_VERSION);
  } catch (err) {
    logger.fatal("Can't update the .version file");
    process.exit(1);
  }
}

//prepare instance of Discord.js client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
  presence: {
    status: BOT_INVISIBLE ? 'invisible' : 'online',
  },
});

const app: BotApplication = {
  client: client,
  logger: logger,
  commands: new Collection(),
  updated: updated,
  version: BOT_VERSION,
  dataPath: DATA_PATH,
  config: {
    USE_DALLE: USE_DALLE,
    INVISIBLE: BOT_INVISIBLE,
    ANNOUNCE_CHANNEL: process.env.ANNOUNCE_CHANNEL || false,
    ANNOUNCE_UPDATES: process.env.ANNOUNCE_UPDATES === 'true',
    ANNOUNCE_READY: process.env.ANNOUNCE_READY === 'true',
  },
};

//load event modules
const eventFiles = fs
  .readdirSync(basePath + '/events')
  .filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`${basePath}/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(app, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(app, ...args));
  }
}

//load command modules
const commandFiles = fs
  .readdirSync(basePath + '/commands')
  .filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`${basePath}/commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  app.commands.set(command.data.name, command);
}
//pwet

//handle process signals
async function closeGracefully(signal) {
  logger.warn(`Received signal to terminate: ${signal}, closing`);
  await client.destroy();
  process.exit(0);
}
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

//start discord's bot
client.login(BOT_TOKEN);
export {};
