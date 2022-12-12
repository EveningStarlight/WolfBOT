const { EmbedBuilder, ChannelType } = require('discord.js')

class Game {
    static games = {}

    static get(guild) {
        if (!(guild.id in Game.games)) {
            Game.games[guild.id] = new Game(guild)
        }
        return Game.games[guild.id]
    }
    static quit(guild) {
        if (guild.id in Game.games) {
            Game.games[guild.id].quit()
            delete Game.games[guild.id]
        }
    }
    static exists(guild) {
        return guild.id in Game.games
    }

    constructor(guild) {
        this.guild = guild
        this.state = 'lobby'
        this.lobby = new Lobby()
    }

    quit() {
        if ('channels' in this) {
            this.channels.quit()
        }
    }

    advanceState() {
        if (this.state === 'lobby') {
            this.state = 'inGame'
            this.players = this.lobby.players
            this.channels = new Channels(this.guild, this.players)
        }
    }
}

class Lobby {
    constructor() {
        this.players = []
    }

    async embed() {
        const playerString =
            this.players.length > 0 ? this.players.join(', ') : 'None Yet!'

        const embed = await new EmbedBuilder()
            .setTitle('Lobby')
            .setColor(0x8eb890)
            .addFields({ name: 'Players', value: playerString })
        return [embed]
    }
}

class Channels {
    constructor(guild, players) {
        this.guild = guild
        this.list = []

        this.init(players)
    }

    async init(players) {
        this.parent = await this.guild.channels.create({
            name: 'Werewolf',
            type: ChannelType.GuildCategory,
            position: 1,
        })

        this.create('day')
        players.forEach((player) => this.create(player.username))
    }

    async create(name) {
        this.list.push(
            await this.guild.channels.create({
                name: name,
                parent: this.parent,
                type: ChannelType.GuildText,
            })
        )
    }

    quit() {
        this.parent.delete()
        this.list.forEach((channel) => channel.delete())
    }
}

module.exports = {
    Game: Game,
}
