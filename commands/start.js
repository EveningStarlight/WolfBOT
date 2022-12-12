const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
} = require('discord.js')
const { Game } = require('../scripts/game.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Starts a new game of Werewolf'),

    async execute(interaction) {
        if (Game.exists(interaction.member.guild)) {
            interaction.reply({
                content: 'A game has already been started!',
                ephemeral: true,
            })
        } else {
            const game = Game.get(interaction.member.guild)
            const components = getComponents()
            const embeds = await game.lobby.embed()

            const message = {
                content: "Let's have a game of werewolf!",
                components: components,
                embeds: embeds,
            }
            await interaction.reply(message)

            game.lobby.interaction = interaction
        }
    },
}

function getComponents() {
    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('joinLobby')
                .setLabel('Join Lobby')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('leaveLobby')
                .setLabel('Leave Lobby')
                .setStyle(ButtonStyle.Danger)
        )
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('startGame')
                .setLabel('Start Game')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setCustomId('quitGame')
                .setLabel('Quit Game')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        )

    return [row1, row2]
}
