module.exports = {
   chooseAction: function(guild,game,player) {
       let mojiArray = [];
       let collector;
       guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Select if you would like to protect or not."+"```").catch(console.error).then(msgg => {
            msgg.react('🚫');
            msgg.react('721914550412247060');
            mojiArray.push('🚫');
            mojiArray.push('heal');
            const filter = (reaction, user) => {
                return mojiArray.includes(reaction.emoji.name) && user.id === player.id;
            };
            collector = msgg.createReactionCollector(filter, { time: 60000 }); 
            let variableName = null;


            collector.on('collect', (reaction, user) => {
                msgg.reactions.forEach(reactionn => {
                        if(reaction.emoji.name === reactionn.emoji.name){
                            
                        }
                        else{
                            reactionn.remove(player.id);    
                        }
                        
                    });
                let once = 0;
                game.players.forEach(playerr => {
                    if(reaction.emoji.name === 'heal'){
                        player.action = "Protect";
                        game.updateActions(user);
                        console.log(player.displayName+" has selected Protect as the Guardian Angel.");
                    }
                    else if(reaction.emoji.name === '🚫'){
                        variableName = null;
                        player.action = "";
                        game.updateActions(user);
                        if(once == 0){
                            console.log(player.displayName+" has cleared their selection.");    
                        }
                        once = once+1
                    }

                });;
            });

            collector.on('end', collected => {
                if(variableName != null){
                        guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"You selected to protect your target."+"```").catch(console.error);
                }
                else{
                        guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```fix\n"+"You did not use your ability."+"```").catch(console.error);  
                }
                msgg.delete();

            });
        });
   }
}
