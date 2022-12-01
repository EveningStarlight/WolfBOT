let oneBull = []
let noBull = []
module.exports = {
    chooseAction: function (guild, game, player) {
        if (player.isAlive) {
            if (game.nightNum != 1 && !noBull.includes(player.id)) {
                let mojiArray = []
                let collector
                let numBullets
                if (oneBull.includes(player.id)) {
                    numBullets = 1
                } else {
                    numBullets = 2
                }
                guild.channels
                    .find(
                        (channel) =>
                            channel.name === player.displayName.toLowerCase()
                    )
                    .send(
                        '```css\n' +
                            'Select someone to shoot and kill. You have ' +
                            numBullets +
                            ' bullet(s).' +
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
                        collector = msgg.createReactionCollector(filter, {
                            time: 60000,
                        })
                        let variableName = null

                        collector.on('collect', (reaction, user) => {
                            msgg.reactions.forEach((reactionn) => {
                                if (
                                    reaction.emoji.name === reactionn.emoji.name
                                ) {
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
                                            ' as the Vigilante.'
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
                                guild.channels
                                    .find(
                                        (channel) =>
                                            channel.name ===
                                            player.displayName.toLowerCase()
                                    )
                                    .send(
                                        '```css\n' +
                                            'You selected to shoot ' +
                                            variableName +
                                            '. You have ' +
                                            (numBullets - 1) +
                                            ' remaining bullet(s).' +
                                            '```'
                                    )
                                    .catch(console.error)
                                if (oneBull.includes(player.id)) {
                                    noBull.push(player.id)
                                } else {
                                    oneBull.push(player.id)
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
            } else if (game.nightNum == 1) {
                guild.channels
                    .find(
                        (channel) =>
                            channel.name === player.displayName.toLowerCase()
                    )
                    .send(
                        '```css\n' +
                            'You cannot shoot on the first night.' +
                            '```'
                    )
                    .catch(console.error)
            } else if (noBull.includes(player.id)) {
                guild.channels
                    .find(
                        (channel) =>
                            channel.name === player.displayName.toLowerCase()
                    )
                    .send('```css\n' + 'You are out of bullets.' + '```')
                    .catch(console.error)
            }
        }
    },
}
