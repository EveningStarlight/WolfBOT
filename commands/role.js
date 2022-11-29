const { SlashCommandBuilder } = require("discord.js");
const rolesFile = require('../scripts/roles.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Provides information about the named role.")
    .addStringOption(option =>
		option.setName('name')
			.setDescription('The role you are looking for')
            .setRequired(true)),

  async execute(interaction) {
    const roleName = interaction.options.getString('name') ?? "error";

    role = rolesFile.roleCheck(roleName);

    if (role != null) {
        const embed = await rolesFile.getRoleEmbed(role);
        await interaction.reply({ embeds: [ embed ] });

    } else {
      await interaction.reply(`The role: ${roleName} was not found`);
    }
  },
};
