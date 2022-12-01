const rolesFile = require('../../scripts/roles.js')

module.exports = {
    autocomplete: async function autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused()
        const filtered = rolesFile
            .getFilteredRoleNames(focusedValue)
            .splice(0, 25)

        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        )
    },

    execute: async function execute(interaction, ephemeral = false) {
        const roleName = interaction.options.getString('name') ?? 'error'

        const role = rolesFile.roleCheck(roleName)

        if (role != null) {
            const embed = await rolesFile.getRoleEmbed(role)
            await interaction.reply({ ephemeral: ephemeral, embeds: [embed] })
        } else {
            await interaction.reply({
                content: `The role: ${roleName} was not found`,
                ephemeral: true,
            })
        }
    },
}
