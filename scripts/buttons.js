const { Game } = require('./game.js')

function processButton(interaction) {
    if (interaction.customId == 'joinLobby') {
        joinLobby(interaction)
    } else if (interaction.customId == 'leaveLobby') {
        leaveLobby(interaction)
    } else if (interaction.customId == 'startGame') {
        startGame(interaction)
    } else if (interaction.customId == 'quitGame') {
        quitGame(interaction)
    }
}

async function joinLobby(interaction) {
    const game = Game.get(interaction.member.guild)

    if (game.state !== 'lobby') {
        interaction.reply({
            content: 'The game has already begun!',
            ephemeral: true,
        })
    } else if (!game.lobby.players.includes(interaction.user)) {
        game.lobby.players.push(interaction.user)
        const embed = await game.lobby.embed()

        interaction.update({ embeds: embed })
    } else {
        interaction.reply({
            content: 'You are already in the lobby!',
            ephemeral: true,
        })
    }
}

async function leaveLobby(interaction) {
    const game = Game.get(interaction.member.guild)

    if (game.state !== 'lobby') {
        interaction.reply({
            content: 'The game has already begun!',
            ephemeral: true,
        })
    } else if (game.lobby.players.includes(interaction.user)) {
        game.lobby.players = game.lobby.players.filter(function (user) {
            return user != interaction.user
        })
        const embed = await game.lobby.embed()

        interaction.update({ embeds: embed })
    } else {
        interaction.reply({
            content: "You aren't in the lobby!",
            ephemeral: true,
        })
    }
}

async function startGame(interaction) {
    const game = Game.get(interaction.member.guild)

    if (game.state !== 'lobby') {
        interaction.reply({
            content: 'The game has already begun!',
            ephemeral: true,
        })
    } else {
        game.advanceState()
        const row2 = interaction.message.components[1]
        row2.components.shift()
        row2.components[0].data.disabled = false
        interaction.update({
            content: 'The game has now begun!',
            components: [row2],
        })
    }
}

async function quitGame(interaction) {
    Game.quit(interaction.member.guild)

    interaction.update({
        content: 'The game has now finished, thanks for playing everyone!',
        components: [],
    })
}

module.exports = {
    processButton: processButton,
}
