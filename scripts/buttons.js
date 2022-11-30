const { getGame } = require("./game.js")

function processButton(interaction) {
    if (interaction.customId == 'joinLobby') {
        joinLobby(interaction)
    } else if (interaction.customId == 'leaveLobby') {
        leaveLobby(interaction)
    } else if (interaction.customId == 'startGame') {
    }
}

async function joinLobby(interaction) {
    const game = getGame()

    if (!game.lobby.players.includes(interaction.user)) {
        game.lobby.players.push(interaction.user)
        const embed = await game.lobby.embed()

        interaction.update({embeds:embed})
    } else {
        interaction.reply({content:"You are already in the lobby!", ephemeral:true})
    }
}

async function leaveLobby(interaction) {
    const game = getGame()

    if (game.lobby.players.includes(interaction.user)) {
        game.lobby.players =  game.lobby.players.filter(function (user) {
            return user != interaction.user
        })
        const embed = await game.lobby.embed()

        interaction.update({embeds:embed})
    } else {
        interaction.reply({content:"You aren't in the lobby!", ephemeral:true})
    }
}

module.exports = {
    processButton: processButton
}
