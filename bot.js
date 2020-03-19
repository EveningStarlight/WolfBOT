const Discord = require('discord.js');
const fetch = require("node-fetch");
const client = new Discord.Client();
client.login('Njg5MTQ2Nzc1MzA2ODk1MzY5.XnKrOg.WL_jj5lHKaLuV_kXxS7487PsbR0');

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("villagers", {type: 'WATCHING'});
});

//The List of recognized commands
var commandWords = ["ping", "start", "play", "day", "night", "lynch", "clear", "help"];

//used to determin if there is already an active game or not.
var isActiveGame = false;
var isGameStarted = false;

//Used to determin if it is day or night
var isDay = true;

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
	const isUserHost = user.roles.has(msg.guild.roles.find(role => role.name === "host").id);
	
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
					channel.send(user + ", there is already an active game");
				} 
				else if (!isActiveGame && !isGameStarted) {
					invitePlayers(guild, msg.member);
				}
				else if (isUserHost) {
					startGame(guild);
				} 
				else {
					channel.send(user + ", you are not a host");
				}
			break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'play':
				if (isActiveGame && !isGameStarted) {
					var villagerRole = guild.roles.find(role => role.name === "villager");
					user.addRole(villagerRole).catch(console.error);
					msg.delete(1000);
				}
				else if (isActiveGame && isGameStarted) {
					var ghostRole = guild.roles.find(role => role.name === "ghost");
					user.addRole(ghostRole).catch(console.error);
					msg.delete(1000);
				}
			break;
			// !day/night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'day':
				if (!isDay && isGameStarted && isUserHost) { 
					isDay = true;
					
					var villagerRole = guild.roles.find(role => role.name === "villager");
					guild.channels.find(channel => channel.name === "day").overwritePermissions( villagerRole, 
						{ SEND_MESSAGES: true});
						
					guild.channels.find(channel => channel.name === "day").send(
						"The sun rises, and you wake for the day");
				}
			break;
			case 'night':
				if (isDay && isGameStarted && isUserHost) {
					isDay = false;
					
					var villagerRole = guild.roles.find(role => role.name === "villager");
					guild.channels.find(channel => channel.name === "day").overwritePermissions( villagerRole, 
						{ SEND_MESSAGES: false});
						
					guild.channels.find(channel => channel.name === "day").send(
						"The sun sets, and you go to sleep");
				}	
			break;
			// !lynch~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'lynch':
				channel.send("To be implemented!");
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clear':
				var hostRole = guild.roles.find(role => role.name === "host");
				if (user.roles.has(hostRole.id)) {
					endGame(guild);
				}
			break;
			// !help~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'help':
				msg.reply("The list of commands are: " + commandWords.join(', '));
			break;
			default:
				msg.reply(cmd + ' is not a valid command.');
			break;
		 }
    }
});

function invitePlayers(guild, host) {
	console.log("inviting players");
	isActiveGame = true;
	
	var role = guild.roles.find(role => role.name === "host");
	host.addRole(role).catch(console.error);
					
	fillRoleArray(guild);
	fillChannelArray(guild);
	guild.channels.find(channel => channel.name === "join-game").send(
		"@here, " + host.toString() + " wants to start a game, please message !play if you want to join");
	
	client.channels.find(channel => channel.name === "host").send(
		"This is for host only messages");
}

function startGame(guild) {
	console.log("Starting Game");
	isGameStarted = true;
	isDay = true;
	const dayChannel = guild.channels.find(channel => channel.name === "day");
	
	dayChannel.send("Welcome everyone to your first day!");
	
	guild.channels.find(channel => channel.name === "join-game").send(
		"A game is in progress, you can spectate as a ghost by using !play");
	
	var villagerRole = guild.roles.find(role => role.name === "villager");
	var ghostRole = guild.roles.find(role => role.name === "ghost");
	
	dayChannel.overwritePermissions( 
		villagerRole, 
		{ VIEW_CHANNEL: true });
		
	dayChannel.overwritePermissions( 
		ghostRole, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: false});
}

//Ends the game, cleans up roles, cleares used channels
function endGame(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isGameStarted = false;
	
	//removes the game roles from every member
	const everyone = guild.fetchMembers().then(r => {
		r.members.array().forEach(user => removeGameRoles(user))
	});
	
	//Removes the chatlog from the used game channels
	chanArray.forEach(chan => {
		clearChannel(chan);
	})
	
	roleArray.clear;
	chanArray.clear;
}

//removes all game Roles from a user
function removeGameRoles(user) {
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
	var role = guild.roles.find(role => role.name === "host");
	roleArray.push(role);
	var role = guild.roles.find(role => role.name === "villager");
	roleArray.push(role);
	var role = guild.roles.find(role => role.name === "ghost");
	roleArray.push(role);
}

//Filles the channelArray with the game channels
function fillChannelArray(guild) {
	var chan = guild.channels.find(channel => channel.name === "host");
	chanArray.push(chan);
	var chan = guild.channels.find(channel => channel.name === "join-game");
	chanArray.push(chan);
}



