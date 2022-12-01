module.exports = {
    chooseAction: function (guild, game, player, botid) {
        let mojiArray = []
        let collector
        let previousPlayer = null
        guild.channels
            .find((channel) => channel.name === 'werewolf')
            .send('```css\n' + 'Select a player to attack.' + '```')
            .catch(console.error)
            .then((msgg) => {
                game.players.forEach((playerr) => {
                    if (
                        !playerr.role.category.includes('Werewolf') &&
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
                        user.id != '689650623871975474'
                    )
                }
                collector = msgg.createReactionCollector(filter, {
                    time: 60000,
                })
                let variableName = null

                collector.on('collect', (reaction, user) => {
                    if (previousPlayer == null) {
                        previousPlayer = user.id
                    } else if (
                        previousPlayer != user.id &&
                        previousPlayer != '689650623871975474'
                    ) {
                        msgg.reactions.forEach((reactionn) => {
                            reactionn.remove(previousPlayer)
                        })
                        previousPlayer = user.id
                    }

                    msgg.reactions.forEach((reactionn) => {
                        if (reaction.emoji.name === reactionn.emoji.name) {
                        } else {
                            reactionn.remove(user.id)
                        }
                    })
                    let once = 0
                    game.players.forEach((playerr) => {
                        if (reaction.emoji.name === playerr.emoteName) {
                            variableName = playerr.displayName
                            game.wolfAction = playerr.displayName
                            game.players.forEach((playerr) => {
                                if (user.id == playerr.id) {
                                    game.wolfName = playerr.displayName
                                    game.updateActions(user)
                                }
                            })

                            console.log(
                                game.wolfName +
                                    ' has selected ' +
                                    playerr.displayName +
                                    ' as the Werewolves.'
                            )
                        } else if (reaction.emoji.name === '🚫') {
                            game.players.forEach((playerr) => {
                                if (user.id == playerr.id) {
                                    game.wolfName = playerr.displayName
                                }
                            })
                            variableName = null
                            game.wolfAction = ''
                            if (once == 0) {
                                console.log(
                                    game.wolfName +
                                        ' has cleared their selection.'
                                )
                            }
                            once = once + 1
                            game.wolfName = ''
                            game.updateActions(user)
                        }
                    })
                })

                collector.on('end', (collected) => {
                    if (variableName != null) {
                        guild.channels
                            .find((channel) => channel.name === 'werewolf')
                            .send(
                                '```css\n' +
                                    'You selected ' +
                                    game.wolfName +
                                    ' to kill ' +
                                    game.wolfAction +
                                    '.' +
                                    '```'
                            )
                            .catch(console.error)
                    } else {
                        guild.channels
                            .find((channel) => channel.name === 'werewolf')
                            .send(
                                '```fix\n' +
                                    'The werewolves did not attack.' +
                                    '```'
                            )
                            .catch(console.error)
                    }
                    msgg.delete()
                })
            })
    },
}
