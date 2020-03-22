const Discord = require('discord.js');
const fs = require('fs');
const fetch = require("node-fetch");
const client = new Discord.Client();
client.login('Njg5NjUwNjIzODcxOTc1NDc0.XnJ3Wg.lhiBeigfhGMyYMqxAwRCbLghjKA');

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("villagers", {type: 'WATCHING'});
});

//The List of recognized commands
var commandWordsBasic = ["ping", "start", "play", "lynch", "help"];
var commandWordsHost = ["day", "night", "kill", "clear"];
var commandWords = commandWordsBasic.concat(commandWordsHost);

//used to determin if there is already an active game or not.
var isActiveGame = false;
var isGameStarted = false;
var rolesIG=[];
//Used to determin if it is day or night
var isDay = true;
var rolesConfirmed = false;
var pleaseConfirm = false;

var numPlayer = 0; //set to 6 for testing
var nominated = [];
var numRoles = 0;
//An array of all the roles that are used in the game
var roleArray = new Array();
//An array of all the channels used by the game
var chanArray = new Array();

//This listens to every message posted in the guild, and checks to see if it is a command
client.on('message', async msg => {  

	const message = msg.content;
	const channel = msg.channel;
	const user = msg.member;
	const guild = msg.guild;
	const isUserHost = user.roles.has(msg.guild.roles.find(role => role.name === "Host").id);
    var data = fs.readFileSync('roles.json');
    var parsedData = JSON.parse(data);
    
	
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
	
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        cmd = cmd.toLowerCase();
		
		
	   
	    //The arguments after the first word
        args = args.splice(1);

		switch(cmd) {
			// !ping~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'ping':
				channel.send("pong!");
			break;
			// !start~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'start':
				if (isActiveGame && isGameStarted) {
					channel.send(user + ", there is already an active game. Use *!play* to spectate as a ghost.");
				} 
				else if (!isActiveGame && !isGameStarted) {
					invitePlayers(guild, msg.member);
				}
				else if (isUserHost && numPlayer >= 6) {
					startGame(guild,parsedData);
				} 
				else if(numPlayer >= 6){
					channel.send(user + ", you are not a host!");
				}
                else if(isUserHost){
                    channel.send(user + ", there are only ["+numPlayer+"/6] minimum required players!");
                }
			break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'play':
			case 'join':
				if (isActiveGame && !isGameStarted && !user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)){
                    numPlayer += 1;
					var villagerRole = guild.roles.find(role => role.name === "Town");
					user.addRole(villagerRole).catch(console.error);
                    if (numPlayer < 6){
                        guild.channels.find(channel => channel.name === "join-game").send(user + " has joined the lobby. ["+ numPlayer+"/6] players till the game can begin.").catch(console.error);
                    }
                    else {
                        guild.channels.find(channel => channel.name === "join-game").send(user + " has joined the lobby. ["+ numPlayer +"] players!").catch(console.error);

                    }
                    console.log(user+" has joined the lobby.");
					msg.delete(1000);
				}
				else if (isActiveGame && isGameStarted) {
					var ghostRole = guild.roles.find(role => role.name === "Dead");
					user.addRole(ghostRole).catch(console.error);
					msg.delete(1000);
				}
                else if (user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)){
                    channel.send(user + ", you are already in the game!");
                }
			break;
			// !day/night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'day':
				if (!isDay && isGameStarted && isUserHost) { 
					isDay = true;
				    var everyoneRole = guild.roles.find(role => role.name === "@everyone");				
					var villagerRole = guild.roles.find(role => role.name === "Town");
                    
                    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
                        if(channelMember[1].roles.has(villagerRole.id)){
                            channelMember[1].setMute(false)
                        }
                    }
                    
					guild.channels.find(channel => channel.name === "day").overwritePermissions( villagerRole, 
						{ SEND_MESSAGES: true});
                    guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions( everyoneRole, 
						{ SEND_MESSAGES: false});
						
					guild.channels.find(channel => channel.name === "day").send(":sunny: The sun rises, and you wake for the day.");
				}
			break;
			case 'night':
				if (isDay && isGameStarted && isUserHost) {
					isDay = false;
                    var everyoneRole = guild.roles.find(role => role.name === "@everyone");				
					var villagerRole = guild.roles.find(role => role.name === "Town");
                    
                    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
                        if(channelMember[1].roles.has(villagerRole.id)){
                            channelMember[1].setMute(true)
                        }
                    }
                    
					guild.channels.find(channel => channel.name === "day").overwritePermissions( villagerRole, 
						{ SEND_MESSAGES: false});
                    guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions( everyoneRole, 
						{ SEND_MESSAGES: true});
						
					guild.channels.find(channel => channel.name === "day").send(":crescent_moon: The sun sets, and you go to sleep.");
				}	
			break;
			// !lynch~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'lynch':
              /*  if (user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)) {
                    var killedVillager = await guild.members.find( user => user.id ===msg.mentions.users.first().id);
					var villagerRole = guild.roles.find(role => role.name === "Town");
				    var ghostRole = guild.roles.find(role => role.name === "Dead");
                    if (killedVillager.roles.has(villagerRole.id)) {
						msg.delete(1000);
						channel.send(user + " has nominated "+killedVillager.toString()+" to the stands!");
                        channel.send("If you would like to second type !second "+killedVillager.toString()+".");
                        nominated.push(killedVillager.toString());
				
						killedVillager.removeRole(villagerRole).catch(console.error);

						killedVillager.addRole(ghostRole).catch(console.error);
                        
					}
                    if (killedVillager.roles.has(ghostRole.id)) {
						msg.delete(1000);
						msg.reply("That user is dead!");

					}
					else {
						msg.reply("We could not find that user.");
					}
                } */
				channel.send("To be implemented!");
			break;
            // !second~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'second':
                if (user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)) {
                    var isNominated = false;
                    var killedVillager = await guild.members.find( user => user.id ===msg.mentions.users.first().id);
                    nominated.forEach(doTheyMatch(killedVillager));
                    
                }
            break;
			// !kill~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'kill':
				//Command must be formatted as !kill @Adam
				if (isUserHost) { 
					var killedVillager = await guild.members.find( user => user.id ===msg.mentions.users.first().id);
					var villagerRole = guild.roles.find(role => role.name === "Town");
				    var ghostRole = guild.roles.find(role => role.name === "Dead");

					
					if (killedVillager.roles.has(villagerRole.id)) {
						msg.delete(1000);
						channel.send(killedVillager.toString() + " has been killed");
						
						killedVillager.removeRole(villagerRole).catch(console.error);

						killedVillager.addRole(ghostRole).catch(console.error);
                        
                        killedVillager.setMute(true)
					}
                    else if (killedVillager.roles.has(ghostRole.id)) {
						msg.delete(1000);
						msg.reply("That user is already dead!");

					}
					else {
						msg.reply("That user isn't playing!");
					}
				}
			break;
            // !confirm~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'confirm':
                var hostRole = guild.roles.find(role => role.name === "Host");
				if (pleaseConfirm && user.roles.has(hostRole.id)) {
                    numRoles = 0;
				    const everyone = guild.fetchMembers().then(r => {
		              r.members.array().forEach(user => assignRoles(user,guild));
                    });	
				}
			break;
            // !refres~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'refresh':
                rolesIG=[];
                var hostRole = guild.roles.find(role => role.name === "Host");
				if (pleaseConfirm && user.roles.has(hostRole.id)) {
					selectRoles(guild,parsedData);
				}
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'mute':

            break;
			case 'clear':
				var hostRole = guild.roles.find(role => role.name === "Host");
				if (user.roles.has(hostRole.id)) {
					endGame(guild);
				}
			break;
			// !help~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'help':
				var str = "The list of commands are: "
				if (isUserHost) {
					 str += commandWords.join(', ');
				}
				else {
					str += commandWordsBasic.join(', ');
				}
				msg.reply(str);
			break;
			default:
				msg.reply(cmd + ' is not a valid command.');
			break;
		 }
    }
});

function invitePlayers(guild, host) {
	console.log("Inviting Players");
	isActiveGame = true;
	
	var role = guild.roles.find(role => role.name === "Host");
	host.addRole(role).catch(console.error);
    const everyoneRole = guild.roles.find(role => role.name === "@everyone");				
	fillRoleArray(guild);
	fillChannelArray(guild);
    guild.createChannel('join-game','text').then(channel => {
        channel.send("@here, " + host.toString() + " wants to start a game, please message !play if you want to join")}).catch(console.error);
	//guild.channels.find(channel => channel.name === "join-game").send("@here, " + host.toString() + " wants to start a game, please message !play if you want to join").catch(console.error);
    guild.createChannel('host','text').then(channel => {
        channel.send("This channel is for hosts to mesage the bot privatly");
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
        channel.overwritePermissions(role, { VIEW_CHANNEL: true });


    })
	//client.channels.find(channel => channel.name === "host").send("This channel is for hosts to mesage the bot privatly").catch(console.error);
}

function startGame(guild,data) {
	console.log("Starting Game");
	isGameStarted = true;
	isDay = true;
    selectRoles(guild,data);
    const everyone = guild.fetchMembers().then(r => {
		r.members.array().forEach(user => createUserChannels(user,guild))});
    guild.createChannel('day','text').then(channel => {
        channel.send("Welcome " + villagerRole.toString() + " to your first day!");
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
    	channel.overwritePermissions( 
		  villagerRole, 
		  { VIEW_CHANNEL: true });
        channel.overwritePermissions( 
		ghostRole, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: false});

    })

    guild.createChannel('dead','text').then(channel => {
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
        channel.overwritePermissions( 
		ghostRole, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: true});

    })
    
    guild.createChannel('night-werewolf','text').then(channel => {
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });

    })
    
    guild.createChannel('day-voice','voice').then(channel => {
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
        channel.overwritePermissions( 
		  villagerRole, 
		  { VIEW_CHANNEL: true });
        
		

	   channel.overwritePermissions( 
		  ghostRole, 
		  {	VIEW_CHANNEL: true,
			SPEAK: false});
        
        everyoneGetInHere(guild,channel);
        
    })
    guild.channels.find(channel => channel.name === "join-game").delete();
	const dayChannel = guild.channels.find(channel => channel.name === "day");
	const dayVoiceChannel = guild.channels.find(channel => channel.name === "day-voice");
	const villagerRole = guild.roles.find(role => role.name === "Town");
    const everyoneRole = guild.roles.find(role => role.name === "@everyone");
	const ghostRole = guild.roles.find(role => role.name === "Dead");
			


}

//Ends the game, cleans up roles, cleares used channels
function endGame(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isGameStarted = false;
	//removes the game roles from every member
    var everyone = guild.fetchMembers().then(r => {
		r.members.array().forEach(user => removeUserChannels(user,guild))
	});
    var everyone = guild.fetchMembers().then(r => {
        r.members.array().forEach(user => removeGameRoles(user))
	});
    
    rolesIG = [];
    numPlayer = 0;
    
    let general = guild.channels.find(channel => channel.name === "General");
    
    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
            channelMember[1].setVoiceChannel(general);
            channelMember[1].setMute(false)
    }
    sleep(1000);
	guild.channels.find(channel => channel.name === "host").delete();
    guild.channels.find(channel => channel.name === "dead").delete();
    guild.channels.find(channel => channel.name === "night-werewolf").delete();
    guild.channels.find(channel => channel.name === "day").delete();
	guild.channels.find(channel => channel.name === "day-voice").delete();
	
	const villagerRole = guild.roles.find(role => role.name === "Town");
	const ghostRole = guild.roles.find(role => role.name === "Dead");

	roleArray.clear;
	chanArray.clear;
}

//removes all game Roles from a user
function removeGameRoles(user) {

}

function doTheyMatch(item,name){
    
}

function createUserChannels(user,guild){
    const everyoneRole = guild.roles.find(role => role.name === "@everyone");
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id)){
        guild.createChannel(user.displayName,'text').then(channel => {
            channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
            channel.overwritePermissions(user, { VIEW_CHANNEL: true });

        })
    }
}

function removeUserChannels(user,guild){
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id) || user.roles.has(guild.roles.find(role => role.name === "Dead").id)){
        guild.channels.find(channel => channel.name === user.displayName.toLowerCase()).delete();
    }
    roleArray.forEach(role => {
		user.removeRole(role).catch(console.error);
	})
}

//Cleares the last 99 messages from the channel
async function clearChannel(chan) {
	try {
		var fetched = await chan.fetchMessages({limit: 99});
		chan.bulkDelete(fetched);
	} catch (error) {
		console.error("clear function failed");
	}
}

//Filles the roleArray with the game roles found in the guild
function fillRoleArray(guild) {
	var role = guild.roles.find(role => role.name === "Host");
	roleArray.push(role);
	var role = guild.roles.find(role => role.name === "Town");
	roleArray.push(role);
	var role = guild.roles.find(role => role.name === "Dead");
	roleArray.push(role);
}

//Filles the channelArray with the game channels
function fillChannelArray(guild) {
	var chan = guild.channels.find(channel => channel.name === "host");
	chanArray.push(chan);
	var chan = guild.channels.find(channel => channel.name === "join-game");
	chanArray.push(chan);
}

function selectRoles(guild,data){
	var chanHost = guild.channels.find(channel => channel.name === "host");
    if (!rolesConfirmed){
            switch(numPlayer){
            case 6:
                seer(data);
                vNegative(data);
                vSupport(data);
                vProtective(data);
                werewolf(data);
                werewolf(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);
            break;   

            case 7:
                seer(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                werewolf(data);
                werewolf(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 8:
                seer(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                werewolf(data);
                werewolf(data);
                nEvil(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 9:
                seer(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                werewolf(data);
                wKilling(data);
                nEvil(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 10:
                seer(data);
                vInvestigative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                werewolf(data);
                wSupport(data);
                wKilling(data);
                nEvil(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n"+rolesIG[9].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 11:
                seer(data);
                vInvestigative(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                werewolf(data);
                wSupport(data);
                wKilling(data);
                nRandom(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n"+rolesIG[9].roleName+"\n"+rolesIG[10].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);
                    
            break;

            case 12:
                seer(data);
                vInvestigative(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                vKilling(data);
                werewolf(data);
                wSupport(data);
                wKilling(data);
                nKilling(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n"+rolesIG[9].roleName+"\n"+rolesIG[10].roleName+"\n"+rolesIG[11].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 13:
                seer(data);
                vInvestigative(data);
                vNegative(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                vKilling(data);
                werewolf(data);
                wSupport(data);
                wKilling(data);
                nKilling(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n"+rolesIG[9].roleName+"\n"+rolesIG[10].roleName+"\n"+rolesIG[11].roleName+"\n"+rolesIG[12].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 14:
                seer(data);
                vInvestigative(data);
                vNegative(data);
                vSupport(data);
                vSupport(data);
                vProtective(data);
                vProtective(data);
                vKilling(data);
                vRandom(data);
                werewolf(data);
                wSupport(data);
                wKilling(data);
                neutral(data);
                nKilling(data);
                pleaseConfirm = true;
                chanHost.send("The role list is as follows: \n"+rolesIG[0].roleName+"\n"+rolesIG[1].roleName+"\n"+rolesIG[2].roleName+"\n"+rolesIG[3].roleName+"\n"+rolesIG[4].roleName+"\n"+rolesIG[5].roleName+"\n"+rolesIG[6].roleName+"\n"+rolesIG[7].roleName+"\n"+rolesIG[8].roleName+"\n"+rolesIG[9].roleName+"\n"+rolesIG[10].roleName+"\n"+rolesIG[11].roleName+"\n"+rolesIG[12].roleName+"\n"+rolesIG[13].roleName+"\n If that is okay type !confirm if not type !refresh."); 
                shuffle(rolesIG);

            break;

            case 15:

            break;

            case 16:

            break;

            case 17:

            break;

            case 18:

            break;

            case 19:

            break;

            }
        }
}

function vNegative(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village Negative"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village Negative",rando)); 
}
    
function vSupport(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village Support"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village Support",rando)); 
    
}
    
function vProtective(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village Protective"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village Protective",rando)); 
    
}
    
function vInvestigative(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village Investigative"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village Investigative",rando));
    
}
    
function vKilling(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village Killing"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village Killing",rando));
    
}

function vRandom(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Village"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Village",rando));
    
}

    
function werewolf(data){
    rolesIG.push(data[125]);
}

function seer(data){
    rolesIG.push(data[37]);    
}
    
function wSupport(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Werewolf Support"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Werewolf Support",rando));
    
}
    
function wKilling(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Werewolf Killing"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Werewolf Killing",rando));
    
}
    
function wRandom(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Werewolf"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Werewolf",rando));
    
}
function neutral(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"True Neutral"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"True Neutral",rando));
    
}
    

function nKilling(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Neutral Killing"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Neutral Killing",rando));
    
}
    
function nEvil(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Neutral Evil"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Neutral Evil",rando));
    
}
    
function nRandom(data){
    numRoles = 0;
    data.forEach(roleThing => rolesCheckNum(roleThing,"Neutral"));
    var rando = Math.floor(Math.random()*numRoles);
    numRoles = 0;
    data.forEach(roleThing => rolesCheck(roleThing,"Neutral",rando));
    
}

function rolesCheckNum(roleThing,roleToCompare){
    if(roleThing.category.includes(roleToCompare)){
        numRoles ++;
        
    }
    
}
function rolesCheck(roleThing,roleToCompare,rando){
    if(roleThing.category.includes(roleToCompare)){
        numRoles ++;
        if(numRoles == rando+1){
            rolesIG.push(roleThing);
        }
    }
    
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function assignRoles(user,guild){
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id)){
        guild.channels.find(channel => channel.name === user.displayName.toLowerCase()).send("Your role is: "+rolesIG[numRoles].roleName+"\n You do: "+rolesIG[numRoles].description);
        if(rolesIG[numRoles].category.includes('Werewolf') || rolesIG[numRoles].roleName == "Lone Wolf" || rolesIG[numRoles].roleName == "White Wolf" || rolesIG[numRoles].roleName == "Undercover Wolf" && rolesIG[numRoles].roleName != "Sorcerer" && rolesIG[numRoles].roleName != "Gremlin" && rolesIG[numRoles].roleName != "Harpy" && rolesIG[numRoles].roleName != "Nightmare" && rolesIG[numRoles].roleName != "Mystic Hunter" && rolesIG[numRoles].roleName != "Sloppy Executioner" && rolesIG[numRoles].roleName != "Dream Wolf") {
            guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions(user, { VIEW_CHANNEL: true });
        }
        numRoles ++;
    }
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function everyoneGetInHere(guild,channel){
    let general = guild.channels.find(channel => channel.name === "General");
    
    for (let member of general.members) {
            member[1].setVoiceChannel(channel);
    }
    
}
