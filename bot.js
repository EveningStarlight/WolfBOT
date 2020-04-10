const Discord = require('discord.js');
const fs = require('fs');
const fetch = require("node-fetch");
const client = new Discord.Client();

const activities_list = [
    "out for Werewolves",
    "out for the Seer",
    "with your food",
    "at home",
    "the dead",
    "your back",
    ];
const types_list = [
    {type: 'WATCHING'},
    {type: 'WATCHING'}, 
    {type: 'PLAYING'},
    {type: 'PLAYING'},
    {type: 'LISTENING'}, 
    {type: 'WATCHING'}
    ];

var myVar;
let roleData;
let allRoles = new Array();
let discordRoles = null;
let nominate = new Object();
nominate.nominations = new Object();
nominate.accused = new Object();

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
    //client.user.setAvatar('./WerewolfOnlineGreen.png')
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
        client.user.setActivity(activities_list[index],types_list[index]); // sets bot's activities to one of the phrases in the arraylist.
    }, 10000);
    
	//client.user.setActivity("villagers", {type: 'WATCHING'});
	roleData = JSON.parse(fs.readFileSync('roles.json'));
  
	let roleSuper = Object.values(roleData);
	let roleSub = new Array();
	roleSuper.forEach(sup => {
		roleSub = roleSub.concat(Object.values(sup));
	});
	roleSub.forEach(sub => {
		allRoles = allRoles.concat(Object.values(sub));
	});
});
client.login(JSON.parse(fs.readFileSync('loginToken.json')).token);

//The List of recognized commands
var commandWordsBasic = ["ping", "start", "play", "lynch", "help"];
var commandWordsHost = ["day", "night", "kill", "clear", "test"];
var commandWords = commandWordsBasic.concat(commandWordsHost);
var output = false;
//used to determin if there is already an active game or not.
var isActiveGame = false;
var isGameStarted = false;
var isDrunk = false;
var rolesIG=[];
//Used to determin if it is day or night
var isDay = true;
var numAlive = 0;
//Used for confirming the bots selection of roles
var rolesConfirmed = false;
var pleaseConfirm = false;
var numPlayer = 0;
var nominated = [];
var numRoles = 0;
var createdMediumChannel = false;
var createdUWolfChannel = false;
//An array of all the roles that are used in the game
var skipped = false;
var drunkRole;
let vote = null;
var busterBuster = true;




//This listens to every message posted in the guild, and checks to see if it is a command
client.on('message', async msg => {  

	if (discordRoles == null) {	fillDiscordRoles(msg.guild); }

	const message = msg.content;
	const channel = msg.channel;
	const user = msg.member;
	const guild = msg.guild;
	const isUserHost = user.roles.has(discordRoles.Host.id) ||
						msg.author.id === client.user.id; //gives bot the permissions of Host

    if(createdUWolfChannel && channel == guild.channels.find(channel => channel.name === 'night-werewolf')){
        if(message.substring(0, 1) == '!'){
            guild.channels.find(channel => channel.name === 'undercover-wolf').send(" !"+message.splice(1));
        }
        else{
            guild.channels.find(channel => channel.name === 'undercover-wolf').send(message);          
        }
        
    }
    
	// Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
		
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        cmd = cmd.toLowerCase();
		
	    //The arguments after the first word
        args = args.splice(1);

		switch(cmd) {
			// !start~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'start':
				if (isActiveGame && isGameStarted) {
					channel.send(user + ", there is already an active game. Use *!play* to spectate as a ghost.");
				} 
				else if (!isActiveGame && !isGameStarted) {
					invitePlayers(guild, msg.member);
				}
				else if (isUserHost && numPlayer >= 6) {
					startGame(guild,roleData);
				} 
				else if(numPlayer >= 6){
					channel.send(user + ", you are not a host!");
				}
                else if(isUserHost){
                    channel.send(user + ", there are only ["+numPlayer+"/6] minimum required players!");
                }
                msg.delete(1000);
			break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'letmein':
				if (isActiveGame && !isGameStarted && !user.roles.has(discordRoles.Town.id) && 10 > Math.floor(Math.random()*100)) {
					msg.reply("No");
                    break;
				}
			case 'play':
			case 'join':
			case 'p':
			case 'j':
				if (isActiveGame && !isGameStarted && !user.roles.has(discordRoles.Town.id)){
                    numPlayer += 1;
					user.addRole(discordRoles.Town).catch(console.error);

                    if (numPlayer < 6){
                        guild.channels.find(channel => channel.name === "join-game").send(user + " has joined the lobby. ["+ numPlayer+"/6] players till the game can begin.").catch(console.error);
                    }
                    else {
                        guild.channels.find(channel => channel.name === "join-game").send(user + " has joined the lobby. ["+ numPlayer +"] players!").catch(console.error);

                    }
                    console.log(user+" has joined the lobby.");

				}
				else if (isActiveGame && isGameStarted) {
					user.addRole(discordRoles.Dead).catch(console.error);
				}
                else if (user.roles.has(discordRoles.Town.id)){
                    channel.send(user + ", you are already in the game!");
                }
                else{
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
				msg.delete(1000);
			break;
			// !day~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'day':
				if (!isDay && isGameStarted && isUserHost) { 
					isDay = true;

                    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
                        if(channelMember[1].roles.has(discordRoles.Town.id)){
                            channelMember[1].setMute(false)
                        }
                    }

                    if(createdMediumChannel){
                        guild.channels.find(channel => channel.name === "mediums-visions").overwritePermissions( everyoneRole, 
						{ SEND_MESSAGES: false});
                        
                    }
 
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: true});
                    guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions( discordRoles.Everyone, 
						{ SEND_MESSAGES: false});
						
					guild.channels.find(channel => channel.name === "day").send(":sunny: The sun rises, and you wake for the day.");
				    msg.delete(1000);
				}
			break;
			// !night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'night':
				if (isDay && isGameStarted && isUserHost) {
					isDay = false;
					nominate.nominations = new Object();
					nominate.accused = new Object();
					nominate.embed = new Discord.RichEmbed();
					nominate.message = null;
					updateNominateEmbed();
					
                    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
                        if(channelMember[1].roles.has(discordRoles.Town.id)){
                            channelMember[1].setMute(true)
                        }
                    }

                    if(createdMediumChannel){
                        guild.channels.find(channel => channel.name === "mediums-visions").overwritePermissions( everyoneRole, 
						{ SEND_MESSAGES: true});
                        
                    }

					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: false});
                    guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions( discordRoles.Everyone, 
						{ SEND_MESSAGES: true});
						
					guild.channels.find(channel => channel.name === "day").send(":crescent_moon: The sun sets, and you go to sleep.");
				    msg.delete(1000);

				}	
			break;
            case 'role':
                output = false;
				role = roleCheck(msg.content.slice(6));
				if (role != null) {
					printRole(role, channel);
				}
                msg.delete(1000);
            break;
            // !nominate~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'nominate':
				let accused = guild.members.find(user => user.id === msg.mentions.users.first().id);
				
				if (isDay && vote == null && user.roles.has(discordRoles.Town.id) && accused.roles.has(discordRoles.Town.id) && accused.id != user.id) {
					if (nominate.nominations[user.displayName.toLowerCase()] != null) {
						nominate.accused[nominate.nominations[user.displayName.toLowerCase()].nominated.displayName.toLowerCase()] = null;
					}
					nominate.nominations[user.displayName.toLowerCase()] = new Object();
					nominate.nominations[user.displayName.toLowerCase()].nominated = accused;
					nominate.nominations[user.displayName.toLowerCase()].nominations = [user.displayName];
					nominate.accused[accused.displayName.toLowerCase()] = nominate.nominations[user.displayName.toLowerCase()];
					
					if (nominate.message != null) { nominate.message.delete(1000); }
					await updateNominateEmbed();
					nominate.message = await guild.channels.find(channel => channel.name === "day").send(nominate.embed);
					msg.delete(1000);
				}
			break;
            // !second~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'second':
			case 'third':
				let accusedS = guild.members.find(user => user.id === msg.mentions.users.first().id);
				if (isDay && vote == null && nominate.accused[accusedS.displayName.toLowerCase()] != null && user.roles.has(discordRoles.Town.id) && accusedS.id != user.id) {
					let alreadySecond = false;
					nominate.accused[accusedS.displayName.toLowerCase()].nominations.forEach(nomination => {
						if (nomination == user.displayName) { alreadySecond = true; }
					});
					if (!alreadySecond) {
						nominate.accused[accusedS.displayName.toLowerCase()].nominations.push(user.displayName);
						if (nominate.message != null) {nominate.message.delete(1000); }
						await updateNominateEmbed();
						nominate.message = await guild.channels.find(channel => channel.name === "day").send(nominate.embed);
						
						if ( (nominate.accused[accusedS.displayName.toLowerCase()].nominations.length == 2 && numAlive < 9) ||
							 (nominate.accused[accusedS.displayName.toLowerCase()].nominations.length == 3 && numAlive < 16)) {
							beginLynch(guild, accusedS);
						}
					}
				}
				else {
					msg.reply("There is nothing to second");
				}
				msg.delete(1000);
            break;
            case 'skip':
                if (isUserHost || vote.player && isDay) {
                    unMuteTown(guild);
                    myStopFunction();
                }
            break;
            case 'disablebuster':
                if (isUserHost) {
                    if(busterBuster){
                        busterBuster = false;
                        console.log('busterBuster enabled');
                    }
                    else{
                        busterBuster = true;
                        console.log('busterBuster disabled');
                    }

                }
            case 'whisper':
                if (user.roles.has(discordRoles.Town.id) && isDay && vote == null && channel == guild.channels.find(channel => channel.name === user.displayName.toLowerCase())){
                    const userMentioned = getChannelFromText(args[0].toLowerCase(),guild);
                    const userMen = getUserFromText(args[0],guild);
                    if(!userMentioned || !userMen){
                        msg.reply('we could not find that user!');
                    }
                    else if(userMen.roles.has(discordRoles.Town.id) && message != '!whisper '+args[0]){
                        userMentioned.send(user+" whispered: "+message.replace('!whisper '+args[0]+' ',''))
                        guild.channels.find(channel => channel.name === "day").send(user+" whispered to "+userMen+"!")
                        console.log(user);
                    }
                    else if(message != '!whisper '+args[0]){
                        msg.reply('please type a message!');
                    }

                }
                else{
                    msg.delete(1000);
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
            break;
			case 'lynch':
                var lynchedVillager = await guild.members.find(user => user.id === msg.mentions.users.first().id);
				if (!isUserHost) {
					msg.reply("You don't have permission to do that");
				}
				else if (!isDay) {
					msg.reply("It is night time");
				}
				else if (vote != null) {
					msg.reply("There is already a vote");
				}
				else if (!lynchedVillager.roles.has(discordRoles.Town.id)) {
					msg.reply("That user is not in the Town");
				}
				else {
					beginLynch(guild, lynchedVillager);
				}
            break;
            case 'inno':
            case 'innocent':
				if (user.roles.has(discordRoles.Town.id) && vote != null && vote.players.remaining.indexOf(user) != -1) {
					vote.players.innocent.push(vote.players.remaining.splice(vote.players.remaining.indexOf(user), 1));
					vote.innocent++;
					await updateVoteEmbed();
					vote.message.edit(vote.embed);
				}
                else if(isUserHost && vote != null){
                    guild.channels.find(channel => channel.name === "day").send("The Town has decided  " + vote.player + " is innocent");
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }
                else{
                    msg.delete(1000);
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }

            break;
			case 'guilt':
            case 'guilty':
				if (user.roles.has(discordRoles.Town.id) && vote != null && vote.players.remaining.indexOf(user) != -1) {
					vote.players.guilty.push(vote.players.remaining.splice(vote.players.remaining.indexOf(user), 1));
					vote.guilty++;
					await updateVoteEmbed();
					vote.message.edit(vote.embed);
				}
				else if(isUserHost && vote != null){
					let dayChannel = guild.channels.find(channel => channel.name === "day");
					dayChannel.send("The Town has decided  that " + vote.player + " is guilty");
					dayChannel.send("!kill " + vote.player);
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }   
                else{
                    msg.delete(1000);
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }


            break;
            case 'abstain':
				if (user.roles.has(discordRoles.Town.id) && vote != null && vote.players.remaining.indexOf(user) != -1) {
					vote.players.abstain.push(vote.players.remaining.splice(vote.players.remaining.indexOf(user), 1));
					vote.abstain++;
					await updateVoteEmbed();
					vote.message.edit(vote.embed);
				}
                else if(isUserHost && vote != null){
					let dayChannel = guild.channels.find(channel => channel.name === "day");
                    dayChannel.send("The Town has decided that " + vote.player + " is guilty");
					dayChannel.send("!kill " + vote.player);
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }    
                else{
                    msg.delete(1000);
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
            break;
			// !kill~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'kill':
				//Command must be formatted as !kill @Adam
				if (isUserHost) { 
                    numAlive = numAlive - 1;
					var killedVillager = await guild.members.find( user => user.id ===msg.mentions.users.first().id);

					if (killedVillager.roles.has(discordRoles.Town.id)) {
						channel.send(killedVillager.toString() + " has been killed");
						await killedVillager.removeRole(discordRoles.Town).catch(console.error);
                        await killedVillager.addRole(discordRoles.Dead).catch(console.error);
                        killedVillager.setMute(true)
					}
                    else if (killedVillager.roles.has(discordRoles.Dead.id)) {
						msg.reply("That user is already dead!");
					}
					else {
						msg.reply("That user isn't playing!");
					}
                    console.log("Number of Alive Players: " + numAlive);
				}
                else{
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
				msg.delete(1000);
			break;
            // !confirm~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'confirm':
				if (pleaseConfirm && isUserHost) {
                    numRoles = 0;
				    const everyone = guild.fetchMembers().then(r => {
		              r.members.array().forEach(user => assignRoles(user,guild));
                    });	
				}
                msg.delete(1000);
			break;
            // !refresh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'refresh':
                rolesIG=[];
				if (pleaseConfirm && isUserHost) {
					selectRoles(guild,roleData);
				}
                isDrunk = false;
                msg.delete(1000);
			break;
			// !test~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'test':
				if (isUserHost) {
					if (args.length == 0 ) {
						numPlayer = 6;
					}
					else if (isUserHost) {
						numPlayer = parseInt(args[0]);
					}
					console.log("numPlayer set to: " + numPlayer);
				}
				msg.delete(1000);
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clear':
				if (isUserHost) {
                    if(isActiveGame && isGameStarted){
                        endGame(guild);  
                    }
                    else if(isActiveGame && !isGameStarted){
                        endGameEarly(guild);
                    }
                    else{
                        msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                    }

				}
                msg.delete(1000);
			break;
			// !help~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'help':
				const embed = await new Discord.RichEmbed();
				if (isUserHost) {
                    embed
                        .setTitle('Host Help')
                        .setColor(0x8eb890)
                        .addField("!start", 'To open a lobby, or to start a full lobby.')
                        .addField("!kill @name", 'To kill the player mentioned.')
                        .addField("!day", "Set's the time to day and allows people to speak in the day channels.")
                        .addField("!night", "Set's the time to night and mutes all players in the day-voice channel and open the night text channels.")
                        .addField("!lynch @name", "Put's that player up on the stand and gives them 30 seconds to make their case.")
                        .addField("!skip", "To skip the 30 seconds above and move directly to the 30 seconds of group discussion preiod.")
                        .addField("!clear", "To end an open game, removing all roles, and moving players back to the General voice channel.")
                        .addField("!help", "Clearly does nothing.")
				}
                else if(user.roles.has(discordRoles.Town.id)) {
                    embed
                        .setTitle('Player Help')
                        .setColor(0x8eb890)
                        .addField("!role rolename", "Gives a description of the named role.")
                        .addField("!whisper playername msg", "To whisper a message to that player.")
                        .addField("!nominate @name", "Nominate a player named.")
                        .addField("!second @name", "Second someone that someone else nominated.")
                        .addField("!guilty", "Will vote guilty on an open trial.")
                        .addField("!innocent", "Will vote innocent on an open trial.")
                        .addField("!abstain", "Will abstain on an open trial.")
                        .addField("!help", "Clearly does nothing.")
				}
				else {
                    embed
                        .setTitle('Help')
                        .setColor(0x8eb890)
                        .addField("!start", 'To open a lobby, or to start a full lobby.')
                        .addField("!play (join, letmein, p, j)", "Joins an open lobby, or spectates an open game.")
                        .addField("!role rolename", "Gives a description of the named role.")
                        .addField("!help", "Clearly does nothing.")
                    
				}
				await channel.send({embed});
                msg.delete(1000);
			break;
			default:
				msg.reply(cmd + ' is not a valid command. Use !help for more information!');
                msg.delete(1000);
			break;
		 }
    }
    else if (user.id == '230433217147043840') {
        msg.delete(1000);
    }
    
    
});

//Begins the process of starting a game by inviting players to join
function invitePlayers(guild, host) {
	console.log("Inviting Players");
	isActiveGame = true;
	fillDiscordRoles(guild);
	
	host.addRole(discordRoles.Host).catch(console.error);			
	
    guild.createChannel('join-game','text').then(channel => {
        channel.send("@here, " + host.toString() + " wants to start a game, please message !play if you want to join")}).catch(console.error);
		
    guild.createChannel('host','text').then(channel => {
        channel.send("This channel is for hosts to mesage the bot privatly");

        channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
        channel.overwritePermissions(discordRoles.Host, { VIEW_CHANNEL: true });
    });
}

//Starts the game
//Creates all game channels
function startGame(guild,data) {
	console.log("Starting Game");
	numAlive = numPlayer;
	
    console.log("Players Alive: " + numAlive);
	isGameStarted = true;
	isDay = true;
    selectRoles(guild,data);
    guild.fetchMembers().then(r => {
		r.members.array().forEach(user => createUserChannels(user,guild))});
		
    guild.createChannel('day','text').then(channel => {
        channel.send("Welcome " + discordRoles.Town.toString() + " to your first day!");
        channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
    	channel.overwritePermissions(discordRoles.Town, 
		{	VIEW_CHANNEL: true });
        channel.overwritePermissions(discordRoles.Dead, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: false,
            ADD_REACTIONS: true});
        outputGroups(channel);
    });
	
    guild.createChannel('dead','text').then(channel => {
        channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
        channel.overwritePermissions( discordRoles.Dead, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
            ADD_REACTIONS: true});
    });
    
    guild.createChannel('night-werewolf','text').then(channel => {
        channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
        channel.overwritePermissions(discordRoles.Host, { VIEW_CHANNEL: true });
        channel.overwritePermissions(discordRoles.Dead, { SEND_MESSAGES: false, ADD_REACTIONS: false });
    });
    
    guild.createChannel('day-voice','voice').then(channel => {
        channel.overwritePermissions(discordRoles.Everyone, 
		{	VIEW_CHANNEL: false });
        channel.overwritePermissions( discordRoles.Town, 
		{	VIEW_CHANNEL: true });
		channel.overwritePermissions( discordRoles.Dead, 
		{	VIEW_CHANNEL: true,
			SPEAK: false});
        
        //Moves all people from day-vice to General
		let generalVoice = guild.channels.find(channel => channel.name === "General");
		let dayVoice = guild.channels.find(channel => channel.name === "day-voice");
		moveVoiceChannels(generalVoice, dayVoice);
    });
	
    guild.channels.find(channel => channel.name === "join-game").delete();
}

//ends the game early
async function endGameEarly(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isGameStarted = false;
    isDrunk = false;
	
	//Deletes all game channels
	//dayVoice.delete().catch(console.error);
	guild.channels.find(channel => channel.name === "host").delete().catch(console.error);
    guild.channels.find(channel => channel.name === "join-game").delete().catch(console.error);

	//removes the game roles from every member
    await guild.fetchMembers().then(r => {
		r.members.array().forEach(user => removeUserChannels(user,guild))
	});

	numPlayer = 0;
	rolesIG = new Array();
	discordRoles = null;
}



//Ends the game, cleans up roles, cleares used channels
async function endGame(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isGameStarted = false;
    isDrunk = false;

	//Moves all people from day-vice to General
	let generalVoice = guild.channels.find(channel => channel.name === "General");
    let dayVoice = guild.channels.find(channel => channel.name === "day-voice");
	await moveVoiceChannels(dayVoice, generalVoice);
	
	//Deletes all game channels
	dayVoice.delete().catch(console.error);
	guild.channels.find(channel => channel.name === "host").delete().catch(console.error);
    guild.channels.find(channel => channel.name === "dead").delete().catch(console.error);
    guild.channels.find(channel => channel.name === "night-werewolf").delete().catch(console.error);
    guild.channels.find(channel => channel.name === "day").delete().catch(console.error);

	//removes the game roles from every member
    await guild.fetchMembers().then(r => {
		r.members.array().forEach(user => removeUserChannels(user,guild))
	});

	numPlayer = 0;
	rolesIG = new Array();
	discordRoles = null;
}


//Creates a privte channel for each player and the host
function createUserChannels(user,guild){
    if (user.roles.has(discordRoles.Town.id)){
        guild.createChannel(user.displayName,'text').then(channel => {
            channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
            channel.overwritePermissions(user, { VIEW_CHANNEL: true });
            channel.overwritePermissions(discordRoles.Host, { VIEW_CHANNEL: true });
        });
    }
}

//Deletes individual channels, and removes game roles
function removeUserChannels(user,guild){
    if (user.roles.has(discordRoles.Town.id) || user.roles.has(discordRoles.Dead.id)){
        guild.channels.find(channel => channel.name === user.displayName.toLowerCase()).delete().catch(console.error);
    }
    if (user.roles.has(discordRoles.Town.id)){
        user.removeRole(discordRoles.Town.id).catch(console.error);
    }
    if (user.roles.has(discordRoles.Host.id)){
        user.removeRole(discordRoles.Host.id).catch(console.error);
    }
    if (user.roles.has(discordRoles.Dead.id)){
        user.removeRole(discordRoles.Dead.id).catch(console.error);
    }

}

//Filles the roleArray with the game roles found in the guild
function fillDiscordRoles(guild) {
	discordRoles = new Object();
	let role = guild.roles.find(role => role.name === "Host");
	discordRoles.Host = role;
	role = guild.roles.find(role => role.name === "Town");
	discordRoles.Town = role;
	role = guild.roles.find(role => role.name === "Dead");
	discordRoles.Dead = role;
	role = guild.roles.find(role => role.name === "@everyone");
	discordRoles.Everyone = role;
}

//Selects the roles based on the number of players.
function selectRoles(guild){
    if (!rolesConfirmed){
		switch(numPlayer){
            case 6:
				randomRole(roleData.Village.Seer);
				randomRole(roleData.Village.Negative);
				randomRole(roleData.Village.Support);
				randomRole(roleData.Village.Protective);
				randomRole(roleData.Werewolf.Werewolf);
				randomRole(roleData.Werewolf.Werewolf);
            break;   

            case 7:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Werewolf);
            break;

            case 8:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Neutral.Evil);
            break;

            case 9:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Evil);
            break;

            case 10:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Evil);
            break;

            case 11:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral);
            break;

            case 12:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Killing);
            break;

            case 13:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Killing);
            break;

            case 14:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Village);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral);
                randomRole(roleData.Neutral.Killing);
            break;

            case 15:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Evil);
                randomRole(roleData.Neutral.Killing);

            break;

            case 16:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Evil);
                randomRole(roleData.Neutral.Killing);

            break;

            case 17:
                randomRole(roleData.Village.Seer);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Negative);
                randomRole(roleData.Village.Investigative);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Support);
                randomRole(roleData.Village.Protective);
                randomRole(roleData.Village.Killing);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Village);
                randomRole(roleData.Werewolf.Werewolf);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Support);
                randomRole(roleData.Werewolf.Killing);
                randomRole(roleData.Neutral.Evil);
                randomRole(roleData.Neutral.Killing);

            break;

            case 18:

            break;

            case 19:

            break;

		}
		pleaseConfirm = true;
		var str = "The role list is as follows:\n";
		for (var i=0; i<rolesIG.length; i++) {
            if(rolesIG[i].roleName == "Drunk"){
                str += drunkRole.roleName + " (Drunk) \n";
            }
            else{
                str += rolesIG[i].roleName + "\n";
            }
		}
		str += "If that is okay type !confirm if not type !refresh.";
		let chanHost = guild.channels.find(channel => channel.name === "host");
		chanHost.send(str);
		shuffle(rolesIG);
	}
}

function outputGroups(channel){
	channel.send("This game includes:");
	switch(numPlayer){
		case 6:
			channel.send("Seer\nVillage Negative\nVillage Support\nVillage Protective\nWerewolf\nWerewolf");

		break;   

		case 7:
			channel.send("Seer\nVillage Negative\nVillage Support\nVillage Support\nVillage Protective\nWerewolf\nWerewolf");

		break;

		case 8:
			channel.send("Seer\nVillage Negative\nVillage Support\nVillage Support\nVillage Protective\nWerewolf\nWerewolf\nNeutral Evil");

		break;

		case 9:
			channel.send("Seer\nVillage Negative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nWerewolf\nWerewolf Killing\nNeutral Evil");

		break;

		case 10:
			channel.send("Seer\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nWerewolf\nWerewolf Support\nWerewolf Killing\nNeutral Evil");
				
		break;

		case 11:
			channel.send("Seer\nVillage Negative\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nWerewolf\nWerewolf Support\nWerewolf Killing\nNeutral Random");

		break;

		case 12:
			channel.send("Seer\nVillage Negative\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nVillage Killing\nWerewolf\nWerewolf Support\nWerewolf Killing\nNeutral Killing");

		break;

		case 13:
			channel.send("Seer\nVillage Negative\nVillage Negative\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nVillage Killing\nWerewolf\nWerewolf Support\nWerewolf Killing\nNeutral Killing");

		break;

		case 14:
			channel.send("Seer\nVillage Negative\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Protective\nVillage Killing\nVillage Random\nWerewolf\nWerewolf Support\nWerewolf Killing\nTrue Neutral\nNeutral Killing");

		break;

		case 15:
			channel.send("Seer\nVillage Investigative\nVillage Support\nVillage Support\nVillage Protective\nVillage Killing\nVillage Random\nVillage Random\nVillage Random\nWerewolf\nWerewolf Support\nWerewolf Support\nWerewolf Killing\nNeutral Evil\nNeutral Killing");

		break;

		case 16:
			channel.send("Seer\nVillage Investigative\nVillage Negative\nVillage Support\nVillage Support\nVillage Protective\nVillage Killing\nVillage Random\nVillage Random\nVillage Random\nWerewolf\nWerewolf Support\nWerewolf Support\nWerewolf Killing\nNeutral Evil\nNeutral Killing");

		break;

		case 17:
			channel.send("Seer\nVillage Investigative\nVillage Negative\nVillage Negative\nVillage Support\nVillage Support\nVillage Protective\nVillage Killing\nVillage Random\nVillage Random\nVillage Random\nWerewolf\nWerewolf Support\nWerewolf Support\nWerewolf Killing\nNeutral Evil\nNeutral Killing");

		break;

		case 18:

		break;

		case 19:

		break;
	}
}


//Selects a random role from the passed data
function randomRole(array) {
    if (Array.isArray(array)) {
        if (-10 > Math.floor(Math.random()*100) && !isDrunk) {
            rolesIG.push(roleData.Village.Drunk[0]);
            isDrunk = true;
            let rando = Math.floor(Math.random()*array.length);
            drunkRole = array[rando];
        }
        else{
            let rando = Math.floor(Math.random()*array.length);
            rolesIG.push(array[rando]);
        }
    }
    else {
        let newArray = new Array();
        Object.values(array).forEach(arr => {
            newArray = newArray.concat(arr);
        });
        randomRole(newArray);
    }
}

//Changes the order of the Array
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

//This gives each user their role from the roleIG array
function assignRoles(user,guild){
    if (user.roles.has(discordRoles.Town.id)){
		let userChannel = guild.channels.find(channel => channel.name === user.displayName.toLowerCase());
		userChannel.send("Your role is:");
		printRole(rolesIG[numRoles], userChannel);
		
		//This gives access to the werewolf channel if a role should have access to it
        if(rolesIG[numRoles].category.includes('Werewolf') || rolesIG[numRoles].roleName == "Lone Wolf" || rolesIG[numRoles].roleName == "White Wolf"){
            if(rolesIG[numRoles].roleName != "Sorcerer" && rolesIG[numRoles].roleName != "Gremlin" && rolesIG[numRoles].roleName != "Harpy" && rolesIG[numRoles].roleName != "Nightmare" && rolesIG[numRoles].roleName != "Mystic Hunter" && rolesIG[numRoles].roleName != "Sloppy Executioner" && rolesIG[numRoles].roleName != "Dream Wolf") {
                guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions(user, { VIEW_CHANNEL: true });
            }
        }
        
        //This checks if a undercover werewolf exists and if it does it creates a channel for it
        if (rolesIG[numRoles].roleName == "Undercover Wolf" && createdUWolfChannel == false){
            guild.createChannel('undercover-wolf','text').then(channel => {
                channel.send("In this channel you will see all messages sent by the wolves! You will not know from whom they come from.");
                channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
                channel.overwritePermissions(user, { VIEW_CHANNEL: true, SEND_MESSAGES: false});});
            
            createdUWolfChannel = true;
        }
        else if(rolesIG[numRoles].roleName == "Undercover Wolf"){
            guild.channels.find(channel => channel.name === 'undercover-wolf').overwritePermissions(user, { VIEW_CHANNEL: true, SEND_MESSAGES: false});
        }

        //This checks if a medium and if it does it creates a channel for it
        if (rolesIG[numRoles].roleName == "Medium" && createdMediumChannel == false){
                guild.createChannel('mediums-visions','text').then(channel => {
                    channel.send("This is the channel for the mediums visions. The medium can type freely in the channel during the night and recieve reactions from the dead!");
                    channel.overwritePermissions(discordRoles.Everyone, { VIEW_CHANNEL: false });
                    channel.overwritePermissions(user, { VIEW_CHANNEL: true });
                    channel.overwritePermissions(discordRoles.Dead, 
                    {	VIEW_CHANNEL: true,
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: true});});
            
            createdMediumChannel = true;
        }
        else if(rolesIG[numRoles].roleName == "Medium"){
            guild.channels.find(channel => channel.name === 'mediums-visions').overwritePermissions(user, { VIEW_CHANNEL: true });
        }

        numRoles ++;
    }
}

//This finds a role given a specific string
function roleCheck(roleString) {
	for (let i = 0; i < allRoles.length; i++) {
		if (allRoles[i].roleName.toLowerCase() == roleString.toLowerCase()) {
			return allRoles[i];
		}
	}
	return null;
}

//This prints a role in a formatted block
async function printRole(role, channel) {
	const embed = await new Discord.RichEmbed()
		.setTitle(role.roleName)
		.setColor(0x8eb890)
		.addField("Description:", role.description)
		.addField("Category:", role.category)
		.addField("Seen as:", role.seenAs)
		.addField("Objective: ", role.winCon);
	await channel.send({embed});
}

async function updateNominateEmbed() {
	nominate.embed = await new Discord.RichEmbed()
		.setTitle('Nominations')
		.setColor(0x8eb890);
	
	Object.values(nominate.nominations).forEach(nomination => {
		let string = "First: " + nomination.nominations[0];
		if (nomination.nominations.length > 1) { string += "\nSecond: " + nomination.nominations[1]; }
		if (nomination.nominations.length > 2) { string += "\nThird: " + nomination.nominations[2];  }
		
		nominate.embed.addField("Nominated: " + nomination.nominated.displayName, string); 
	});
}

async function updateVoteEmbed() {
	vote.embed = await new Discord.RichEmbed()
		.setTitle('Vote')
		.setColor(0x8eb890)
		.addField("Nominated", "Player: " + vote.player)
		.addField("Votes", 	"Innocent: \t" + vote.innocent + "\n" +
							"Guilty: \t" + vote.guilty + "\n" +
							"Abstain: \t" + vote.abstain + "\n")
		.addField("Innocent", "Players: " + vote.players.innocent.toString())
		.addField("Guilty", "Players: " + vote.players.guilty.toString())
		.addField("Abstain", "Players: " + vote.players.abstain.toString())
		.addField("Remaining", "Players: " + vote.players.remaining.toString());
}

async function beginLynch(guild, lynchedVillager) {
	vote = new Object();
	vote.player = lynchedVillager;
	vote.innocent = 0;	vote.guilty = 0;	vote.abstain = 0;
	vote.players = new Object();
	vote.players.remaining = new Array();
	vote.players.innocent = new Array();
	vote.players.guilty = new Array();
	vote.players.abstain = new Array();

	guild.channels.find(channel => channel.name === "day").send(
		vote.player.toString() + " has been put up on the stand! " + 
		vote.player.toString() + " has 30 seconds to make their case!");
		
	
	for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
		if(channelMember[1].roles.has(discordRoles.Town.id) && channelMember[1] != vote.player){
			channelMember[1].setMute(true)
		}
	}
	
	const arrayPromises = [];
	guild.fetchMembers().then(r => {
		r.members.array().forEach(user => {
			if (user.roles.has(discordRoles.Town.id) && user != vote.player) {
				arrayPromises.push(vote.players.remaining.push(user));
			}
		})
	});	
	await Promise.all(arrayPromises)
		.catch(err => console.log(err));
	await updateVoteEmbed();
	vote.message = await guild.channels.find(channel => channel.name === "host").send(vote.embed);
	
	wait30Seconds(guild);
}

function unMuteTown(guild){
    guild.channels.find(channel => channel.name === "day").send("The town has 30sec to discuss what they heard!");
    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
        if(channelMember[1].roles.has(discordRoles.Town.id)){
            channelMember[1].setMute(false)
        }
    }
    setTimeout(muteAllVote,30000,guild);    
}

function muteAllVote(guild){
    guild.channels.find(channel => channel.name === "day").send("Everyone must now vote! Either !guilty | !innocent | !abstain");
    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
        if(channelMember[1].roles.has(discordRoles.Town.id)){
            channelMember[1].setMute(true)
        }
    }
    guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: false});
    voting = true;
}

//Moves everyone from the old channel to the new channel
async function moveVoiceChannels(oldChannel, newChannel) {
	console.log("Moving all players from " + oldChannel.name + " to " + newChannel.name);
	const movePromises = [];
	for (let channelMember of oldChannel.members) {
		movePromises.push(channelMember[1].setVoiceChannel(newChannel));
		channelMember[1].setMute(false);
    }
	
	await Promise.all(movePromises)
		.then(() => console.log('Player successfully moved'))
		.catch(err => console.log(err));
}

function wait30Seconds(guild) {
  myVar = setTimeout(function(){ unMuteTown(guild); }, 30000);
}


function myStopFunction() {
  clearTimeout(myVar);
}

function getChannelFromText(text, guild){
    if(!text) return;
    
    if(guild.channels.exists('name',text)){
        return guild.channels.find(channel => channel.name === text);
    } 
}

function getUserFromText(text, guild){
    if(!text) return;
    text = text.toLowerCase();
    if(guild.members.exists(m => m.displayName.toLowerCase() === text)){
        return guild.members.find(m => m.displayName.toLowerCase() === text);
    }
    //return guild.members.find(m => m.nickname === text);
}


function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.find(user => user.id == mention);
	}
}