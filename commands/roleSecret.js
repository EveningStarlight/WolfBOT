const { SlashCommandBuilder } = require('discord.js')
const helper = require('./helpers/role.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rolesecret')
        .setDescription('Secretly provides information about the named role.')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('The role you are looking for')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        helper.autocomplete(interaction)
    },

    async execute(interaction) {
        helper.execute(interaction, true)
    },
}
