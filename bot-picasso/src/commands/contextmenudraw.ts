require('dotenv').config({
  path: '../../.env' + process.env.NODE_ENV ? '.' + process.env.NODE_ENV : '',
});
const wait = require('node:timers/promises').setTimeout;

// eslint-disable-next-line import/no-extraneous-dependencies
const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandType } = require('discord-api-types/v9');
const { getDallEImage } = require('../lib/openai-dall-e');
const { dalle2tppt } = require('../lib/tppt-api');

const commands = new ContextMenuCommandBuilder()
  .setName('Generer une image')
  .setType(ApplicationCommandType.Message);

/* COMMANDS */

async function commandDraw(client, interaction) {
  const targetMessage = interaction.targetMessage;
  //ignore bot messages
  if (targetMessage.author.bot) return;
  if (targetMessage.partial) {
    await targetMessage.fetch();
  }

  interaction.deferReply({ content: 'Je peint...', ephemeral: true });

  try {
    //call openai api

    const messageAuthor = targetMessage.author.username;

    const messageContent = targetMessage.content;
    client.logger.debug('message: ' + messageContent);

    const dalleUrl = await getDallEImage(messageContent);
    client.logger.debug('dalleUrl: ' + dalleUrl);

    if (!dalleUrl) return;

    const tpptUrl = await dalle2tppt(dalleUrl);
    client.logger.debug('tpptUrl: ' + tpptUrl);

    if (!tpptUrl) return;

    const responseMessage = `Voici l'interpretation de ce message par bob l'artiste: \n${tpptUrl}`;
    interaction.targetMessage.reply(responseMessage);
    const loggerMsg = `Dessin du message ${targetMessage.id} demandée par ${interaction.user.username}`;
    client.logger.info(loggerMsg);
    interaction.editReply({
      content: 'géneration effectuée !',
      ephemeral: true,
    });
    await wait(3000);
    interaction.deleteReply();
  } catch (error) {
    client.logger.error(error);
  }
}

module.exports = {
  data: commands,
  async execute(client, interaction) {
    await commandDraw(client, interaction);
  },
};
