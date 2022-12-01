module.exports = {
    chooseAction: function (guild, game, player) {
        if (player.isAlive) {
            let mojiArray = []
            let collector
            guild.channels
                .find(
                    (channel) =>
                        channel.name === player.displayName.toLowerCase()
                )
                .send(
                    '```css\n' +
                        'Select a player to cover in water, or select the snow to freeze.' +
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
                    msgg.react('❄️')
                    mojiArray.push('🚫')
                    mojiArray.push('❄️')
                    const filter = (reaction, user) => {
                        return (
                            mojiArray.includes(reaction.emoji.name) &&
                            user.id === player.id
                        )
                    }
                    collector = msgg.createReactionCollector(filter, {
                        time: 60000,
                    })
                    let variableName = null

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
                                variableName = playerr.displayName
                                player.action = playerr.displayName
                                game.updateActions(user)
                                console.log(
                                    player.displayName +
                                        ' has selected ' +
                                        playerr.displayName +
                                        ' as the Cryogenicist.'
                                )
                            } else if (reaction.emoji.name === '❄️') {
                                variableName = 'Freeze'
                                player.action = 'Freeze'
                                game.updateActions(user)
                                console.log(
                                    player.displayName +
                                        ' has selected Freeze as the Cryogenicist.'
                                )
                            } else if (reaction.emoji.name === '🚫') {
                                variableName = null
                                player.action = ''
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
                        if (variableName != null) {
                            if (variableName == 'Freeze') {
                                guild.channels
                                    .find(
                                        (channel) =>
                                            channel.name ===
                                            player.displayName.toLowerCase()
                                    )
                                    .send(
                                        '```css\n' +
                                            'You selected to freeze everyone covered in water.' +
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
                                        '```css\n' +
                                            'You selected ' +
                                            variableName +
                                            ' to cover in water.' +
                                            '```'
                                    )
                                    .catch(console.error)
                            }
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
