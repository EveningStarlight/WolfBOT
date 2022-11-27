let usedImmunity = [];

module.exports = {
   chooseAction: function(guild,game,player) {
       if(player.isAlive){
           let mojiArray = [];
           let collector;
           let immunity = "";
           if (game.nightNum == 1){
               guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Select the team you believe will win."+"```").catch(console.error).then(msgg => {
                    msgg.react('701404681913499688').then(() => msgg.react('722541136392224778')).then(() => msgg.react('722540328027947119'));
                    const filter = (reaction, user) => {
                        return ['Villager','Werewolf','Neutral'].includes(reaction.emoji.name) && user.id === player.id;
                    };
                    collector = msgg.createReactionCollector(filter, { time: 50000 }); 
                    let variableName = null;


                    collector.on('collect', (reaction, user) => {
                        msgg.reactions.forEach(reactionn => {
                            if(reaction.emoji.name === reactionn.emoji.name){

                            }
                            else{
                                reactionn.remove(player.id);    
                            }

                        });
                        if(reaction.emoji.name === "Villager"){
                            player.action = "Village"+immunity;
                            variableName = "Village";
                            game.updateActions(user);
                            console.log(player.displayName+" has selected Village as the Nostradamus.");
                        }
                        else if(reaction.emoji.name === "Werewolf"){
                            player.action = "Werewolves"+immunity;
                            variableName = "Werewolves";
                            game.updateActions(user);
                            console.log(player.displayName+" has selected Werewolves as the Nostradamus.");

                        }
                        else if(reaction.emoji.name === "Neutral"){
                            player.action = "Neutral"+immunity;
                            variableName = "Neutral";
                            game.updateActions(user);
                            console.log(player.displayName+" has selected Neutral as the Nostradamus.");

                        }
                    });

                    collector.on('end', collected => {
                        if(variableName != null){
                            guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"You selected "+variableName+" team."+"```").catch(console.error);
                        }
                        else{
                            const index = Math.floor(Math.random() * (3 - 1) + 1);
                            if(index == 1){
                                player.action = "Village"+immunity;
                                variableName = "Village";
                                game.updateActions(player);
                            }
                            else if(index == 2){
                                player.action = "Werewolves"+immunity;
                                variableName = "Werewolves";
                                game.updateActions(player);

                            }
                            else if(index == 3){
                                player.action = "Neutral"+immunity;
                                variableName = "Neutral";
                                game.updateActions(player);

                            }
                            guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```fix\n"+"You were randomly assigned the "+variableName+" team."+"```").catch(console.error);  
                        }
                        msgg.delete();

                    });
                });
            }
           if(!usedImmunity.includes(player)){
               guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Select if you would like to gain immunity."+"```").catch(console.error).then(msgg => {
                    msgg.react('✅').then(() => msgg.react('🚫'));
                    const filter = (reaction, user) => {
                        return ['✅','🚫'].includes(reaction.emoji.name) && user.id === player.id;
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
                        if(reaction.emoji.name === "✅"){
                            player.action = player.action+" Gain Immunity";
                            variableName = "Gain Immunity";
                            immunity = "Gain Immunity"
                            game.updateActions(user);
                            console.log(player.displayName+" has selected Gain Immunity as the Nostradamus.");
                        }
                        else if(reaction.emoji.name === "🚫"){
                            player.action = "";
                            variableName = null;
                            immunity = "";
                            game.updateActions(user);
                            console.log(player.displayName+" has cleared their selection.");

                        }
                    });

                    collector.on('end', collected => {
                        if(variableName != null){
                            guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"You selected to "+variableName.toLowerCase()+"."+"```").catch(console.error);
                            usedImmunity.push(player);
                        }
                        else{
                            guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```fix\n"+"You did not use your ability."+"```").catch(console.error);  
                        }
                        msgg.delete();

                    });
                });

           }
           
    }
       
       
   }
}
