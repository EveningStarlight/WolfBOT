const fs = require('node:fs')
const path = require('node:path')
const { Events, Client, Collection, GatewayIntentBits } = require('discord.js')
require('dotenv/config')
const { processButton } = require('./scripts/buttons.js')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
})

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        )
    }
}

const activities_list = [
    'out for Werewolves',
    'out for the Seer',
    'with your food',
    'at home',
    'the dead',
    'your back',
]

const types_list = [
    { type: 'WATCHING' },
    { type: 'WATCHING' },
    { type: 'PLAYING' },
    { type: 'PLAYING' },
    { type: 'LISTENING' },
    { type: 'WATCHING' },
]

client.on('ready', () => {
    console.log('The bot is ready')

    client.user.setPresence({
        game: {
            name: activities_list[0],
            type: types_list[0],
        },
    })
    setInterval(() => {
        const index = Math.floor(
            Math.random() * (activities_list.length - 1) + 1
        )
        client.user.setPresence({
            game: {
                name: activities_list[index],
                type: types_list[index],
            },
        })
    }, 10000)
})

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            )
            return
        }

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        }
    } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            )
            return
        }

        try {
            await command.autocomplete(interaction)
        } catch (error) {
            console.error(error)
        }
    } else if (interaction.isButton()) {
        processButton(interaction)
    }
})

client.login(process.env.TOKEN)
