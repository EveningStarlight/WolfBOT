module.exports = {
    chooseAction: function (guild, game, player) {
        if (player.isAlive && game.nightNum == 1) {
            let mojiArray = []
            let collector
            guild.channels
                .find(
                    (channel) =>
                        channel.name === player.displayName.toLowerCase()
                )
                .send(
                    '```css\n' +
                        'Select a player to be your role model.' +
                        '```'
                )
                .catch(console.error)
                .then((msgg) => {
                    game.players.forEach((playerr) => {
                        if (
                            player.displayName != playerr.displayName &&
                            playerr.isAlive
                        ) {
                            msgg.react(playerr.emoteID)
                            mojiArray.push(playerr.emoteName)
                        }
                    })
                    msgg.react('🚫')
                    mojiArray.push('🚫')
                    const filter = (reaction, user) => {
                        return (
                            mojiArray.includes(reaction.emoji.name) &&
                            user.id === player.id
                        )
                    }
                    console.log(mojiArray)
                    collector = msgg.createReactionCollector(filter, {
                        time: 50000,
                    })
                    let variableName

                    collector.on('collect', (reaction, user) => {
                        msgg.reactions.forEach((reactionn) => {
                            if (reaction.emoji.name === reactionn.emoji.name) {
                            } else {
                                reactionn.remove(player.id)
                            }
                        })
                        game.players.forEach((playerr) => {
                            if (reaction.emoji.name === playerr.emoteName) {
                                console.log('true')
                                variableName = playerr.displayName
                                player.action = playerr.displayName
                                game.updateActions(user)
                            } else if (reaction.emoji.name === '🚫') {
                                variableName = ''
                                player.action = ''
                                game.updateActions(user)
                            }
                        })
                    })

                    collector.on('end', (collected) => {
                        if (variableName != null || variableName != '') {
                            guild.channels
                                .find(
                                    (channel) =>
                                        channel.name ===
                                        player.displayName.toLowerCase()
                                )
                                .send(
                                    '```css\n' +
                                        'Your role model is ' +
                                        variableName +
                                        '.' +
                                        '```'
                                )
                                .catch(console.error)
                        } else {
                            guild.channels
                                .find(
                                    (channel) =>
                                        channel.name ===
                                        player.displayName.toLowerCase()
                                )
                                .send(
                                    '```fix\n' +
                                        'You did not use your ability.' +
                                        '```'
                                )
                                .catch(console.error)
                        }
                        msgg.delete()
                    })
                })
        }
    },
}
