const Discord = require('discord.js');
const fetch = require("node-fetch");
const client = new Discord.Client();
client.login('Njg5MTQ2Nzc1MzA2ODk1MzY5.Xm-oow.DCL3dVOd7pXyP_WwVNpIQtKrfg8');

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("villagers", {type: 'WATCHING'});
});

//The List of recognized commands
var commandWords = ["ping", "start", "play", "day", "night", "lynch", "clear", "help"];

//used to determin if there is already an active game or not.
var isActiveGame = false;

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
	const user = msg.author;
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
				if (isActiveGame) {
					channel.send(msg.author + ", there is already an active game");
				} else {
					console.log("starting game");
					isActiveGame=true;
					
					fillRoleArray(msg.guild);
					fillChannelArray(msg.guild);
					client.channels.find(channel => channel.name === "join-game").send(
						"@here, " + user.toString() + " wants to start a game, please message !play if you want to join")
						/*
						.then(
						function (joinMessage) { joinMessage.react('👍')
						}).catch(console.error);
						*/
					
					var role = msg.guild.roles.find(role => role.name === "host");
					msg.member.addRole(role).catch(console.error);
					hostID = msg.member;
					
					client.channels.find(channel => channel.name === "host").send(
						"This is for host only messages");
						
					/*
					const emoji = new Array('⏯️', '🛏️', '🚫');
					client.channels.find(channel => channel.name === "host").send(
						"Please react with the following to control the game\n" +
						emoji[0] + "️ - starts the game\n" +
						emoji[1] + " - begins the night\n" +
						emoji[2] + " - ends the game\n"
						).then(
						async function (hostMessage) { 
							try {
								await hostMessage.react(emoji[0]);
								await hostMessage.react(emoji[1]);
								await hostMessage.react(emoji[2]);
							} catch(error) {
								console.error("one of the emoji'sfailed to react.");
							}
							
							const filter = (reaction, user) => {
								return emoji.includes(reaction.emoji.name) && user.id !== hostMessage.author.id;
							};
							
							hostMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
								.then(collected => {
									const reaction = collected.first();
									switch(reaction.emoji.name) {	
										case emoji[0]:
										startGame(msg.guild);
											hostMessage.reply('you reacted with start.');
											break;
										case emoji[1]:
											hostMessage.reply('you reacted with sleep');
											break;
										case emoji[2]:
											hostMessage.reply('you reacted with end');
											endGame(msg.guild);
											break;
									}
								})
								.catch(collected => {
									console.error("");
								});
						});
						
						*/
				}
			break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'play':
				var role = msg.guild.roles.find(role => role.name === "villager");
				msg.member.addRole(role).catch(console.error);
				msg.delete(1000);
			break;
			// !day/night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'day':
				if (!isDay) { 
					isDay = true;
					
				}
			case 'night':
				if (isDay) {
					isDay = false;
				}
				
			break;
			// !lynch~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'lynch':
				channel.send("To be implemented!");
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clear':
				endGame(msg.guild);
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

function startGame(guild) {
	guild.channels.find(channel => channel.name === "join-game").fetchMessages({ limit: 1}).then(async function (messages) {
		const lastMessage = await messages.first();
		console.log("\n\n");
		console.log(lastMessage);
		
		let filtered = await lastMessage.reactions.filter(a => a._emoji.name == '👍');
		console.log("\n\n");
		console.log(filtered);
		
		let players = filtered.first().users;
		console.log("\n\n");
		console.log(players);
		
	});
}

//Ends the game, cleans up roles, cleares used channels
function endGame(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isDay = true;
	
	//removes the game roles from every member
	const everyone = guild.fetchMembers().then(r => {
		r.members.array().forEach(r => {
			roleArray.forEach(role => {
				r.removeRole(role).catch(console.error);
			})
		})
	});
	
	//Removes the chatlog from the used game channels
	chanArray.forEach(chan => {
		clearChannel(chan);
	})
	
	roleArray.clear;
	chanArray.clear;
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



