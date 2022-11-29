module.exports = {
   chooseAction: function(guild,game,player) {
       if(player.isAlive){
           let mojiArray = [];
           let collector;
           let selectedOne;
           let selectedTwo;
           guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Select which of your abilities you would like to use."+"```").catch(console.error).then(msgg => {
                msgg.react('722531413802614879').then(() => msgg.react('722531473546149989')).then(() => msgg.react('🚫'));
                const filter = (reaction, user) => {
                    return ["kill",'health','🚫'].includes(reaction.emoji.name) && user.id === player.id;
                };
                collector = msgg.createReactionCollector(filter, { time: 60000 }); 
                

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
                        if(reaction.emoji.name === 'health'){
                            selectedOne = "Heal";
                            if(selectedTwo != null){
                                player.action = selectedOne+" "+selectedTwo;
                                game.updateActions(user);
                                console.log(player.displayName+" has selected to"+selectedOne+" "+selectedTwo+" as the Witch.");
                                
                            }
                            else{
                                
                                
                            }
                            
                        }
                        if(reaction.emoji.name === 'kill'){
                            selectedOne = "Kill"
                            if(selectedTwo != null){
                                player.action = selectedOne+" "+selectedTwo;
                                game.updateActions(user);
                                console.log(player.displayName+" has selected to"+selectedOne+" "+selectedTwo+" as the Witch.");
                                
                            }
                            else{
                                
                                
                            }
                            
                        }
                        else if(reaction.emoji.name === '🚫'){
                            player.action = "";
                            selectedOne = null;
                            game.updateActions(user);
                            if(once == 0){
                                console.log(game.wolfName+" has cleared their selection.");    
                            }
                            once = once+1
                        }

                    });;
                });

                collector.on('end', collected => {
                    if(selectedOne != null && selectedTwo != null){
                        guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"You selected to "+selectedOne.toLowerCase()+" "+selectedTwo+"."+"```").catch(console.error);
                    }
                    else{
                         guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```fix\n"+"You did not use your ability."+"```").catch(console.error);  
                    }
                    msgg.delete();

                });
            });
           guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Select a player to use your selected ability on."+"```").catch(console.error).then(msgg => {
               msg2 = msgg;
               game.players.forEach(async playerr => {
                   if(player.displayName != playerr.displayName && playerr.isAlive){
                       await msgg.react(playerr.emoteID);
                       mojiArray.push(playerr.emoteName);
                    }
                })
                msgg.react('🚫');
                mojiArray.push('🚫');
                const filter = (reaction, user) => {
                    return mojiArray.includes(reaction.emoji.name) && user.id === player.id;
                };
                collector = msgg.createReactionCollector(filter, { time: 60000 }); 
                

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
                        if(reaction.emoji.name === playerr.emoteName){
                            selectedTwo = playerr.displayName;
                            if(selectedOne != null){
                                player.action = selectedOne+" "+selectedTwo;
                                game.updateActions(user);
                                console.log(player.displayName+" has selected to"+selectedOne+" "+selectedTwo+" as the Witch.");
                                
                            }
                            else{
                                
                                
                            }
                            
                        }
                        else if(reaction.emoji.name === '🚫'){
                            player.action = "";
                            selectedTwo = null;
                            game.updateActions(user);
                            if(once == 0){
                                console.log(game.wolfName+" has cleared their selection.");    
                            }
                            once = once+1
                        }

                    });;
                });

                collector.on('end', collected => {
                    msgg.delete();

                });
            });
       }
   }
}
