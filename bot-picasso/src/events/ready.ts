import { BotApplication } from '../types/BotApplication';

interface Server {
  name: string;
  id: string;
}

module.exports = {
  name: 'ready',
  once: true,
  async execute(app: BotApplication) {
    const guilds = app.client.guilds.cache;
    const serverArray: Array<Server> = [];

    //populate server names and guild ids
    guilds.forEach(async (guild) => {
      //in cache ?
      if (!guild.available) {
        //fetch
        await guild.fetch();
      }
      serverArray.push({
        name: guild.name,
        id: guild.id,
      });
    });

    const serverList = serverArray.map((server) => {
      return `${server.name} (${server.id})`;
    });

    app.logger.info(`NPC-Picasso v${app.version} ready !`);
    app.logger.info(
      `Logged in as ${app.client.user.tag} on ${
        guilds.size
      } servers: ${serverList.join(', ')}`
    );
    if (app.config.INVISIBLE) {
      app.logger.warn('Bot status set to invisible !');
      app.client.user.setStatus('invisible');
    }
  },
};
