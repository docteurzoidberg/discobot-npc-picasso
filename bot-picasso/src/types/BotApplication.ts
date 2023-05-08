import { Collection } from 'discord.js';
import { BotCommand } from './BotCommand';
import { BotConfig } from './BotConfig';

export interface BotApplication {
  client: any;
  logger: any;
  commands: Collection<string, BotCommand>;
  updated: boolean;
  version: string;
  dataPath: string;
  config: BotConfig;
}
