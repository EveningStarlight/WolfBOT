module.exports = {
    chooseAction: function (guild, game, player) {
        if (player.isAlive) {
            let mojiArray = []
            let collector
            let selectedOne = null
            let selectedTwo = null
            let msg1
            let msg2
            guild.channels
                .find(
                    (channel) =>
                        channel.name === player.displayName.toLowerCase()
                )
                .send('```css\n' + 'Select a player to protect.' + '```')
                .catch(console.error)
                .then((msgg) => {
                    msg1 = msgg
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
                    collector = msgg.createReactionCollector(filter, {
                        time: 60000,
                    })

                    collector.on('collect', (reaction, user) => {
                        msgg.reactions.forEach((reactionn) => {
                            if (reaction.emoji.name === reactionn.emoji.name) {
                            } else {
                                reactionn.remove(player.id)
                            }
                        })
                        let once = 0
                        game.players.forEach((playerr) => {
                            if (reaction.emoji.name === playerr.emoteName) {
                                selectedOne = playerr.displayName
                                if (selectedOne == selectedTwo) {
                                    selectedTwo = null
                                    msg2.reactions.forEach((reactionn) => {
                                        if (
                                            reactionn.emoji.name ===
                                            reaction.emoji.name
                                        ) {
                                            reactionn.remove(player.id)
                                        }
                                    })

                                    player.action = ''
                                    game.updateActions(user)
                                    if (once == 0) {
                                        console.log(
                                            player.displayName +
                                                ' has cleared their selection.'
                                        )
                                    }
                                    once = once + 1
                                } else if (selectedTwo != null) {
                                    player.action =
                                        selectedOne + ' and ' + selectedTwo
                                    game.updateActions(user)
                                    console.log(
                                        player.displayName +
                                            ' has selected ' +
                                            selectedOne +
                                            ' and ' +
                                            selectedTwo +
                                            ' as the Chronomancer.'
                                    )
                                } else {
                                }
                            } else if (reaction.emoji.name === '🚫') {
                                player.action = ''
                                selectedOne = null
                                game.updateActions(user)
                                if (once == 0) {
                                    console.log(
                                        player.displayName +
                                            ' has cleared their selection.'
                                    )
                                }
                                once = once + 1
                            }
                        })
                    })

                    collector.on('end', (collected) => {
                        if (selectedOne != null && selectedTwo != null) {
                            guild.channels
                                .find(
                                    (channel) =>
                                        channel.name ===
                                        player.displayName.toLowerCase()
                                )
                                .send(
                                    '```css\n' +
                                        'You selected ' +
                                        selectedOne +
                                        ' to protect and ' +
                                        selectedTwo +
                                        ' to kill in their place.' +
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
            guild.channels
                .find(
                    (channel) =>
                        channel.name === player.displayName.toLowerCase()
                )
                .send(
                    '```css\n' +
                        'Select a player to kill in their place.' +
                        '```'
                )
                .catch(console.error)
                .then((msgg) => {
                    msg2 = msgg
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
                    collector = msgg.createReactionCollector(filter, {
                        time: 60000,
                    })

                    collector.on('collect', (reaction, user) => {
                        msgg.reactions.forEach((reactionn) => {
                            if (reaction.emoji.name === reactionn.emoji.name) {
                            } else {
                                reactionn.remove(player.id)
                            }
                        })
                        let once = 0
                        game.players.forEach((playerr) => {
                            if (reaction.emoji.name === playerr.emoteName) {
                                selectedTwo = playerr.displayName
                                if (selectedOne == selectedTwo) {
                                    selectedOne = null
                                    msg1.reactions.forEach((reactionn) => {
                                        if (
                                            reactionn.emoji.name ===
                                            reaction.emoji.name
                                        ) {
                                            reactionn.remove(player.id)
                                        }
                                    })
                                    player.action = ''
                                    game.updateActions(user)
                                    if (once == 0) {
                                        console.log(
                                            player.displayName +
                                                ' has cleared their selection.'
                                        )
                                    }
                                    once = once + 1
                                } else if (selectedOne != null) {
                                    player.action =
                                        selectedOne + ' and ' + selectedTwo
                                    game.updateActions(user)
                                    console.log(
                                        player.displayName +
                                            ' has selected ' +
                                            selectedOne +
                                            ' and ' +
                                            selectedTwo +
                                            ' as the Chronomancer.'
                                    )
                                } else {
                                }
                            } else if (reaction.emoji.name === '🚫') {
                                player.action = ''
                                selectedTwo = null
                                game.updateActions(user)
                                if (once == 0) {
                                    console.log(
                                        player.displayName +
                                            ' has cleared their selection.'
                                    )
                                }
                                once = once + 1
                            }
                        })
                    })

                    collector.on('end', (collected) => {
                        msgg.delete()
                    })
                })
        }
    },
}
