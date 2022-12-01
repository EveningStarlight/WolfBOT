module.exports = {
    chooseAction: function (guild, game, player) {
        if (game.nightNum == 1) {
            let seer = null
            let collector
            game.players.forEach((playerr) => {
                if (player.role.roleName == 'Seer') {
                    seer = player.displayName
                }
            })
            if (seer != null) {
                guild.channels
                    .find(
                        (channel) =>
                            channel.name === player.displayName.toLowerCase()
                    )
                    .send('```css\n' + 'The seer is ' + seer + '.```')
                    .catch(console.error)
            } else {
                guild.channels
                    .find(
                        (channel) =>
                            channel.name === player.displayName.toLowerCase()
                    )
                    .send('```fix\n' + 'There is no seer.```')
                    .catch(console.error)
            }
        }
    },
}
