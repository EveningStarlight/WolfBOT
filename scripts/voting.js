module.exports = {
   voteChoice: function(guild,game,player,vote) {
       if(player.isAlive){
           let collector;
           guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"Vote either innocent, guilty, or abstain on "+vote.player.displayName+"."+"```").catch(console.error).then(msgg => {
                msgg.react('725484385372995664').then(() => msgg.react('725484385331052564')).then(() => msgg.react('725484384932593755'));
                const filter = (reaction, user) => {
                    return ['innocentw','guiltyw','abstainw'].includes(reaction.emoji.name) && user.id === player.id;
                };
                collector = msgg.createReactionCollector(filter, { time: 30000 }); 
                let variableName = null;
                

                collector.on('collect', (reaction, user) => {
                    msgg.reactions.forEach(reactionn => {
                        if(reaction.emoji.name === reactionn.emoji.name){
                            
                        }
                        else{
                            reactionn.remove(player.id);    
                        }
                        
                    });
                    
                    if(reaction.emoji.name === 'innocentw'){
                        variableName = "Innocent";
                        
                    }
                    else if(reaction.emoji.name === 'guiltyw'){
                        variableName = "Guilty";
                    }
                    else if(reaction.emoji.name === 'abstainw'){
                        variableName = "Abstain"
                    }

                });

                collector.on('end', collected => {
                    if(variableName == "Innocent"){
                        vote.players.innocent.push(vote.players.remaining.splice(vote.players.remaining.indexOf(player), 1));
                        vote.innocent++;
                        vote.updateVoteEmbed();
                        vote.message.edit(vote.embed);
                        console.log("innocent");
                    }
                    else if(variableName == "Guilty"){
                        vote.players.guilty.push(vote.players.remaining.splice(vote.players.remaining.indexOf(player), 1));
                        vote.guilty++;
                        vote.updateVoteEmbed();
                        vote.message.edit(vote.embed);
                        console.log("guilty")
                    }
                    else if(variableName == "Abstain"){
                        vote.players.abstain.push(vote.players.remaining.splice(vote.players.remaining.indexOf(player), 1));
                        vote.abstain++;
                        vote.updateVoteEmbed();
                        vote.message.edit(vote.embed);
                        console.log("abstain")
                    }
                    if(variableName != null){
                        guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```css\n"+"You selected to vote "+vote.player.displayName+" "+variableName+"."+"```").catch(console.error);
                    }
                    else{
                        guild.channels.find(channel => channel.name === player.displayName.toLowerCase()).send("```fix\n"+"You did not vote in time and have abstained."+"```").catch(console.error);
                        vote.players.abstain.push(vote.players.remaining.splice(vote.players.remaining.indexOf(player), 1));
                        vote.abstain++;
                        vote.updateVoteEmbed();
                        vote.message.edit(vote.embed);
                    }
                    vote.updateVoteEmbed();
                    vote.message.edit(vote.embed);
                    console.log("Innocent: "+vote.players.innocent.toString());
                    console.log("Guilty: "+vote.players.guilty.toString());
                    console.log("Abstain: "+vote.players.abstain.toString());
                    console.log("Leftovers: "+vote.players.remaining.toString());
                    msgg.delete();

                });
            });
       }
   }
}
