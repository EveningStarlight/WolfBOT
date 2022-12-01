const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require("discord.js");

let game = null

function getGame() {
    if (game === null) {
        createGame()
    }

    return game
}

function createGame() {
    game = {
        lobby: {
            players: [],
            embed: getLobbyEmbed
        }
    }
}

function quiteGame() {
    game = null
}


async function getLobbyEmbed() {

    playerList = game.lobby.players.length>0 ? game.lobby.players.join(", ") : 'None Yet!'

    const embed = await new EmbedBuilder()
        .setTitle("Lobby")
        .setColor(0x8eb890)
        .addFields(
            { name: 'Players', value: playerList },
        );
    return [embed]
}

module.exports = {
    getGame: getGame
}
