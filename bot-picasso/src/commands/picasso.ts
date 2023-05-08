import { BotApplication } from '../types/BotApplication';

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

const dalle = require('../lib/openai-dall-e');
const tppt = require('../lib/tppt-api');
const helpers = require('../lib/discobot-helpers');

const getTime = (date): number => {
  return date ? new Date(date).getTime() : 0;
};

const commands = new SlashCommandBuilder()
  .setName('picasso')
  .setDescription('Le bot artiste de la guilde')

  //update
  .addSubcommand((subcommand) =>
    subcommand
      .setName('draw')
      .setDescription('Generer une image')
      .addStringOption((option) =>
        option.setName('prompt').setDescription('Prompt').setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName('private')
          .setDescription('Ne pas afficher publiquement ?')
          .setRequired(false)
      )
  );

const separatorLine = '----------------------------------------';

//format user settings for display in message
const _formatSettings = (settings) => {
  const announceCreate = settings.ANNOUNCE_CREATE ? '✅' : '❌';
  const announceUpdate = settings.ANNOUNCE_UPDATE ? '✅' : '❌';
  const announceComplete = settings.ANNOUNCE_COMPLETE ? '✅' : '❌';
  const announceUncomplete = settings.ANNOUNCE_UNCOMPLETE ? '✅' : '❌';
  const announceDelete = settings.ANNOUNCE_DELETE ? '✅' : '❌';
  const announceUndelete = settings.ANNOUNCE_UNDELETE ? '✅' : '❌';
  const announceSettingsText = `Annoncer:\n${announceCreate} **Création**\n${announceUpdate} **Modification**\n${announceComplete} **Validation**\n${announceUncomplete} **Annulation de validation**\n${announceDelete} **Suppression**\n${announceUndelete} **Annulation de suppression** `;
  const publicSettingsText = `Public:\n**Nom**: ${settings.PUBLIC_NAME}\n**Avatar**: ${settings.PUBLIC_AVATAR}`;
  return `${announceSettingsText}\n\n${publicSettingsText}`;
};

const amap = async (arr, fun) =>
  await Promise.all(arr.map(async (v) => await fun(v)));

const _getUserName = async (app, interaction, userNameOrId) => {
  const unknown = 'Utilisateur inconnu';
  if (!userNameOrId) {
    return unknown;
  }
  if (userNameOrId.match(/^[0-9]+$/)) {
    try {
      const guild = await app.client.guilds.fetch(interaction.guildId);
      const member = await guild.members.fetch(userNameOrId);
      if (!member) {
        app.logger.error('user not in guild: ' + userNameOrId);
        return unknown;
      }
      return member.nickname || member.user.username;
    } catch (error) {
      return unknown;
    }
  }
  return userNameOrId;
};

const _getUserTag = async (app: BotApplication, interaction, userNameOrId) => {
  const unknown = 'Utilisateur inconnu';
  if (!userNameOrId) {
    return unknown;
  }
  if (userNameOrId.match(/^[0-9]+$/)) {
    try {
      const guild = await app.client.guilds.fetch(interaction.guildId);
      const member = await guild.members.fetch(userNameOrId);
      if (!member) {
        app.logger.error('user not in guild: ' + userNameOrId);
        return unknown;
      }
      return `<@${member.id}>`;
    } catch (error) {
      return unknown;
    }
  }
  return userNameOrId;
};

const _getUserNames = async (
  app: BotApplication,
  interaction,
  usersOrIds = []
) => {
  const usernames = await amap(usersOrIds, async (userNameOrId) => {
    const userName = await _getUserName(app, interaction, userNameOrId);
    return userName;
  });
  return usernames;
};

const _getUserTags = async (
  app: BotApplication,
  interaction,
  usersOrIds = []
) => {
  const userTags = await amap(usersOrIds, async (userNameOrId) => {
    const userTag = await _getUserTag(app, interaction, userNameOrId);
    return userTag;
  });
  return userTags;
};

const _generateDallePrompt = (title) => {
  const prompt = `imagine un personnage de jeu rpg en style pixel-art vue top-down, qui est en train d'accomplir la quête intitulée [${title}]`;
  return prompt;
};

async function commandDraw(app: BotApplication, interaction) {
  const userName = app.client.users.cache.get(interaction.user.id).username;
  const channelName = interaction.channel.name;
  const prompt = interaction.options.getString('prompt');
  const isPrivate = interaction.options.getBoolean('private') || false;

  //take long time so tell discord
  interaction.deferReply({ ephemeral: true });

  try {
    app.logger.info(
      `Generation de l'image avec le prompt: "${prompt}" dans ${helpers.formatChannelName(
        channelName
      )} par ${helpers.formatUsername(userName)}`
    );
    const dalleImage = await dalle.getDallEImage(prompt);
    app.logger.debug(dalleImage);

    //uploads to tppt
    const tpptUrl = await tppt.dalle2tppt(dalleImage);
    app.logger.debug(tpptUrl);

    interaction.editReply({
      content: `Image génerée: ${tpptUrl}`,
      ephemeral: true,
    });
  } catch (error) {
    interaction.editReply({
      content: `Erreur lors de la génération de l'image: ${error.message}`,
      ephemeral: true,
    });
    app.logger.error('Erreur lors de la commande add');
    app.logger.debug(error.message);
    app.logger.debug(error.stack);
  }
}

/* Module exports */

module.exports = {
  data: commands,
  async execute(app: BotApplication, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const commandgroup = interaction.options.getSubcommandGroup();
    app.logger.debug(
      `Commande ${subcommand}${
        commandgroup != null ? ` (du groupe ${commandgroup})` : ''
      } lancée par ${interaction.user.username}`
    );
    switch (commandgroup) {
      case null:
        switch (subcommand) {
          case 'draw':
            return await commandDraw(app, interaction);
          default:
            interaction.reply({
              content: `Désolé mais, la commande ${subcommand} n'existe pas ou n'est pas encore implementée :(`,
              ephemeral: true,
            });
        }
        return;
      default:
        interaction.reply({
          content: `Désolé mais, le groupe de commande ${commandgroup} n'existe pas ou n'est pas encore implementée :(`,
          ephemeral: true,
        });
        return;
    }
  },
  async autocomplete(app: BotApplication, interaction) {
    const focusedOption = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand();
    let choices = [];
    switch (focusedOption.name) {
      default:
        break;
    }
    const filtered = choices.filter((choice: any) => {
      //return only choices that name property contains the value. case insensitive
      return (
        choice.name.toLowerCase().indexOf(focusedOption.value.toLowerCase()) >
        -1
      );
    });
    await interaction.respond(filtered);
  },
};