module.exports = {
   chooseAction: function(guild,game,player) {
           let mojiArray = [];
           let collector;
           let previousPlayer = null;
           guild.channels.find(channel => channel.name === "werewolf").send("```css\n"+"Select an extra player to attack."+"```").catch(console.error).then(msgg => {
               game.players.forEach(playerr => {
                   if(!playerr.role.category.includes("Werewolf") && playerr.isAlive){
                       msgg.react(playerr.emoteID);
                        mojiArray.push(playerr.emoteName);
                    }
                });;
                msgg.react('🚫');
                mojiArray.push('🚫');
                const filter = (reaction, user) => {
                    return mojiArray.includes(reaction.emoji.name);
                };
                collector = msgg.createReactionCollector(filter, { time: 60000 }); 
                let variableName = null;
                

                collector.on('collect', (reaction, user) => {
                    
                    if (previousPlayer != user){ 
                        msgg.reactions.forEach(reactionn => {
                            reactionn.remove(player.id);    
                        });
                        previousPlayer = user;
                        
                    }
                    else if(previousPlayer == null){
                        previousPlayer = user;
                        
                    }
                    else{
                        
                    }
                    msgg.reactions.forEach(reactionn => {
                        if(reaction.emoji.name === reactionn.emoji.name){
                            
                        }
                        else{
                            reactionn.remove(player.id);    
                        }
                        
                    });
                    let once = 0;
                    game.players.forEach(playerr => {
                        if(reaction.emoji.name === playerr.emoteName){
                            variableName = playerr.displayName;
                            game.wolfAction = game.wolfAction+" and "+playerr.displayName;
                            game.wolfName = user.displayName;
                            game.updateActions(user);
                            console.log(game.wolfName+" has selected "+game.wolfAction+" as the Werewolves.");
                        }
                        else if(reaction.emoji.name === '🚫'){
                            variableName = null;
                            game.wolfAction = "";
                            game.wolfName = '';
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
                        guild.channels.find(channel => channel.name === "werewolf").send("```css\n"+"You selected "+game.wolfName+" to kill "+game.wolfAction+"."+"```").catch(console.error);
                    }
                    else{
                         guild.channels.find(channel => channel.name === "werewolf").send("```fix\n"+"The werewolves did not attack."+"```").catch(console.error);  
                    }
                    msgg.delete();

                });
            });
   }
}
