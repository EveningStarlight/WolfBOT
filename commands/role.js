const { SlashCommandBuilder } = require("discord.js");
const rolesFile = require('../scripts/roles.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Provides information about the named role.")
    .addStringOption(option =>
		option.setName('name')
			.setDescription('The role you are looking for')
            .setRequired(true)
            .setAutocomplete(true)),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const choices = rolesFile.getAllRoleNames()
    filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase())).slice(0, 25);
    if(focusedValue.length > 1){
        filtered = choices.filter(function (choice) { return choice.toLowerCase().includes(focusedValue.toLowerCase()); });;
        console.log(focusedValue);
    }
    else{
        filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase())).slice(0, 25);
    }
	
	await interaction.respond(
		filtered.map(choice => ({ name: choice, value: choice })),
	);
  },


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
