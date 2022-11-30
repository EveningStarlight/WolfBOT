const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("components")
    .setDescription("tests component functionality!"),

  async execute(interaction) {
    const members = await interaction.guild.members.fetch()
    const names = members.map((member) => {
      return member.nickname ?? member.user.username
    })

    const options = names.map((name) => {
      return {
          "label": name,
          "value": name
      }
    })

    const message = {
        "content": "This is a message with components",
        "components": [
            {
                "type": 1,
                "components": [
                    {
                        "type": 2,
                        "label": "Yes",
                        "style": 1,
                        "custom_id": "click_yes"
                    },
                    {
                        "type": 2,
                        "label": "No",
                        "style": 4,
                        "custom_id": "click_no"
                    }
                ]
            },
            {
                "type": 1,
                "components": [
                    {
                        "type": 3,
                        "custom_id": "option_select",
                        "options": options,
                    }
                ]

            },
            {
                "type": 1,
                "components": [
                    {
                        "type": 5,
                        "custom_id": "user_select"
                    }
                ]
            }
        ]
    }
    await interaction.reply(message);
  },
};
