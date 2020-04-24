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

const emoji_list = [
"<:Wolf_Seer:701405443637116938>",
"<:anxious_wolf:701403284597899315>",
"<:wolfgang:701407344265003009>",
"<:wolf:701406638216839178>",
"<:Junior_Werewolf:701405445654315068>",
"<:MelonWolf:701403464332214282>",
"<:Nightmare_Werewolf:701405445386010624>",
"<:ReallyWolf:701403464823210044>",
"<:Seer:701405443561357332>",
"<:Spirit_Seer:701405443599106108>",
"<:Werewolf_Berserk:701405443792306256>",
"<:Legosi_Hmpf:701403461962563595>",
"<:villager_idc:701404684052725771>",
"<:Villager:701404681913499688>",
"<:totallyawolf:701406641152720956>",
"<:Villager:701404684522618880>",
"<:detective:701405804489605120>",
"<:furrywolfs:701406641358372885>",
"<:furrywolfh:701406641270030387>",
"<:drunkwolf:701406641282744331>",
"<:Cursed:701405445880938516>",
"<:crystal_ball:701404918115860561>",
"<:wolf_face:701162130652528641>"
    ];

var myVar;
let roleData;
let playGroups;
let discordChannels;
let allRoles = new Array();
let discordRoles = null;
let nominate = new Object();
nominate.nominations = new Object();
nominate.accused = new Object();
let vote = null;
let game;
let playersInLobby = new Array();
let embedMSG;
let numPlayer;

client.on('ready', async () => {
    //client.user.setAvatar('./WerewolfOnlineGreen.png')
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
        client.user.setActivity(activities_list[index],types_list[index]); // sets bot's activities to one of the phrases in the arraylist.
    }, 10000);
  
	roleData = JSON.parse(fs.readFileSync('roles.json'));
	playGroups = JSON.parse(fs.readFileSync('playGroups.json'));
	discordChannels = JSON.parse(fs.readFileSync('channels.json'));
	let roleSuper = Object.values(roleData);
	let roleSub = new Array();
	roleSuper.forEach(sup => {
		roleSub = roleSub.concat(Object.values(sup));
	});
	roleSub.forEach(sub => {
		allRoles = allRoles.concat(Object.values(sub));
	});
	
	newGame();
	
	console.log(`Logged in as ${client.user.tag}!`);
});
client.login(JSON.parse(fs.readFileSync('loginToken.json')).token);

//used to determin if there is already an active game or not.
var isDrunk = false;
var rolesIG=[];
//Used to determin if it is day or night
var numAlive = 0;
//Used for confirming the bots selection of roles
var rolesConfirmed = false;
var pleaseConfirm = false;
//var nominated = [];
var numRoles = 0;
//An array of all the roles that are used in the game
var skipped = false;
var drunkRole;
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

    if(game.channels.undercover != null && game.channels.werewolf != null  && channel.name == game.channels.werewolf.name){
        if(message.substring(0, 1) == '!'){
            guild.channels.find(channel => channel.name === 'undercover').send(" !"+message.splice(1));
        }
        else{
            guild.channels.find(channel => channel.name === 'undercover').send(message);          
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
				if (game.isActive && game.isStarted) {
					channel.send(user + ", there is already an active game. Use *!play* to spectate as a ghost.");
				} 
				else if (!game.isActive && !game.isStarted) {
					invitePlayers(guild, msg.member);
				}
				else if (isUserHost && game.players.number() >= 6) {
					if (args.length != 0 && playGroups[args[0]] != null) {
						game.playGroup = playGroups[args[0]]["players_" + game.players.number()];
						console.log(args[0] + " play group selected");
					} 
					else {
						game.playGroup = playGroups["normal"]["players_" + game.players.number()];
						console.log("normal play group selected");
					}
					startGame(guild);
				} 
				else if(game.players.number() >= 6){
					channel.send(user + ", you are not a host!");
				}
                else if(isUserHost){
                    channel.send(user + ", there are only [" + game.players.number() + "/6] minimum required players!");
                }
			break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'letmein':
				if (game.isActive && !game.isStarted && !user.roles.has(discordRoles.Town.id) && 10 > Math.floor(Math.random()*100)) {
					msg.reply("No");
                    break;
				}
			case 'play':
			case 'join':
			case 'p':
			case 'j':
				if (game.isActive && !game.isStarted && !user.roles.has(discordRoles.Town.id)){
                    const index = Math.floor(Math.random() * (emoji_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
					game.addPlayer(user);
					user.addRole(discordRoles.Town).catch(console.error);
                    
                    if(user.id == '230433217147043840'){//user is Buster
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:buster:701416891305951323>").catch(console.error);
                        
                    }
                    else if(user.id == '298116458851074070'){//user is Adam
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:adam:701418909106045029>").catch(console.error);
                        
                    }
                    else if(user.id == '688911285655699458'){//user is Alex
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:alex:701418908963438643>").catch(console.error);
                        
                    }
                    else if(user.id == '164246870179315713'){//user is Andrew
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:andrew:701416894502010940>").catch(console.error);
                        
                    }
                    else if(user.id == '332317117816897536'){//user is Andy
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:andy:701416895454380093>").catch(console.error);
                        
                    }
                    else if(user.id == '186646350220361728'){//user is Ariq
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:ariq:701417165072367668>").catch(console.error);
                        
                    }
                    else if(user.id == '382990666873044992'){//user is Dayna
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:mild_dayna:701416986801864714>").catch(console.error);
                        
                    }
                    else if(user.id == '239257392649338890'){//user is Gaelan
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:gaelan:701420026862895204>").catch(console.error);
                        
                    }
                    else if(user.id == '324734610997116928'){//user is Julianna
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:juliemoji:701416889385222225>").catch(console.error);
                        
                    }
                    else if(user.id == '170632428182831104'){//user is Morgan
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:morgan:701416892153200650>").catch(console.error);
                        
                    }
                    else if(user.id == '135053966353367040'){//user is Rafe
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:rafe_wtf:701416986143490079>").catch(console.error);
                        
                    }
                    else if(user.id == '130435999259033600'){//user is Chandler
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. <:chandy_boy:701416989796597830>").catch(console.error);
                        
                    }
                    else{
                        guild.channels.find(channel => channel.name === "join_game").send(user.displayName + " has joined the lobby. "+ emoji_list[index]).catch(console.error);

                    }
                    await updateJoinEmbed();
                    joinMessage.edit(embedMSG);
                    console.log(user.displayName + " has joined the lobby.");
				}
				else if (game.isActive && game.isStarted) {
					user.addRole(discordRoles.Dead).catch(console.error);
				}
                else if (user.roles.has(discordRoles.Town.id)){
                    channel.send(user + ", you are already in the game!");
                }
                else{
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
			break;
			// !day~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'day':
				if (!game.isDay && game.isStarted && isUserHost) { 
					game.isDay = true;

                    for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
                        if(channelMember[1].roles.has(discordRoles.Town.id)){
                            channelMember[1].setMute(false)
                        }
                    }

                    if(game.channels.medium != null){
                        game.channels.medium.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: false});
                    }
 
					game.channels.day.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: true});
                    game.channels.werewolf.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: false});
						
					game.channels.day.send(":sunny: The sun rises, and you wake for the day.");
				}
			break;
			// !night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'night':
				if (game.isDay && game.isStarted && isUserHost) {
					game.isDay = false;
					
					nominate.nominations = new Object();
					nominate.accused = new Object();
					nominate.embed = new Discord.RichEmbed();
					nominate.message = null;
					updateNominateEmbed();
					
					game.actions = null;
					game.updateActions();
					
                    for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
                        if(channelMember[1].roles.has(discordRoles.Town.id)){
                            channelMember[1].setMute(true)
                        }
                    }

                    if(game.channels.medium != null){
                        game.channels.medium.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: true});
                    }

					game.channels.day.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: false});
                    game.channels.werewolf.overwritePermissions( discordRoles.Town, 
						{ SEND_MESSAGES: true});
						
					game.channels.day.send(":crescent_moon: The sun sets, and you go to sleep.");

				}	
			break;
            case 'role':
				role = roleCheck(msg.content.slice(6));
				if (role != null) {
					printRole(role, channel);
				}
            break;
            // !nominate~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'nominate':
				let accused = await game.players.find(user => user.id === msg.mentions.users.first().id);
				if (accused == null) {
					accused = await getUserFromText(args[0], guild);
				}
				
				if (game.isDay && vote == null && user.roles.has(discordRoles.Town.id) && accused.roles.has(discordRoles.Town.id) && accused.id != user.id) {
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
				}
			break;
            // !second~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'second':
			case 'third':
				let accusedS = await game.players.find(user => user.id === msg.mentions.users.first().id);
				if (accusedS == null) {
					accusedS = await getUserFromText(args[0], guild);
				}
				if (game.isDay && vote == null && nominate.accused[accusedS.displayName.toLowerCase()] != null && user.roles.has(discordRoles.Town.id) && accusedS.id != user.id) {
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
            break;
			case 'a':
			case 'action':
				if (user.roles.has(discordRoles.Town.id) && game.isStarted && !game.isDay) {
					game.players.find(player => player.id === user.id).action = args.join(' ');
					msg.reply("Your action has been set to: " + game.players.find(player => player.id === user.id).action);
					game.updateActions();
				}
			break;
            case 'skip':
                if (isUserHost || vote.player && game.isDay) {
                    unMuteTown(guild);
                    myStopFunction();
                }
            break;
            case 'disablebuster':
                if (isUserHost) {
					busterBuster = !busterBuster;
					console.log("busterBuster: " + busterBuster);
                }
            case 'whisper':
                if (user.roles.has(discordRoles.Town.id) && game.isDay && vote == null && channel == guild.channels.find(channel => channel.name === user.displayName.toLowerCase())){
                    const userMentioned = getChannelFromText(args[0].toLowerCase(),guild);
                    const userMen = getUserFromText(args[0],guild);
                    if(!userMentioned || !userMen){
                        msg.reply('we could not find that user!');
                    }
                    else if(userMen.roles.has(discordRoles.Town.id) && message != '!whisper '+args[0]){
                        userMentioned.send(user+" whispered: "+message.replace('!whisper '+args[0]+' ',''))
                        guild.channels.find(channel => channel.name === "day").send(user+" whispered to "+userMen+"!")
                    }
                    else if(message != '!whisper '+args[0]){
                        msg.reply('please type a message!');
                    }

                }
                else{
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
            break;
			case 'lynch':
                var lynchedVillager = await game.players.find(user => user.id === msg.mentions.users.first().id);
				if (!isUserHost) {
					msg.reply("You don't have permission to do that");
				}
				else if (!game.isDay) {
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
                    game.channels.day.send("The Town has decided  " + vote.player + " is innocent");
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }
                else{
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
					let role = vote.player.role;
					if (args.length != 0 ) {
						role = roleCheck(args[0]);
					}
					game.channels.day.send("The Town has decided  that " + vote.player + " is guilty.\nThey were the " + role.roleName);
					game.channels.day.send("!kill " + vote.player);
					printRole(role, game.channels.day);
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }   
                else{
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
                    game.channels.day.send("The Town has decided that " + vote.player + " is guilty");
					game.channels.day.send("!kill " + vote.player);
					vote = null;
					for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
						if(channelMember[1].roles.has(discordRoles.Town.id)){
							channelMember[1].setMute(false)
						}
					}
					guild.channels.find(channel => channel.name === "day").overwritePermissions( discordRoles.Town, { SEND_MESSAGES: true});
                }    
                else{
                    msg.reply("Oak's words echoed... There's a time and place for everything, but not now.");
                }
            break;
			// !kill~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'kill':
				//Command must be formatted as !kill @Adam
				if (isUserHost) { 
                    numAlive = numAlive - 1;
					var killedVillager = await game.players.find( user => user.id === msg.mentions.users.first().id);

					if (killedVillager.roles.has(discordRoles.Town.id)) {
						channel.send(killedVillager.toString() + " has been killed");
						await killedVillager.removeRole(discordRoles.Town).catch(console.error);
                        await killedVillager.addRole(discordRoles.Dead).catch(console.error);
                        killedVillager.setMute(true);
						killedVillager.isAlive = false;
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
			break;
            // !confirm~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'confirm':
				if (pleaseConfirm && isUserHost) {
                    numRoles = 0;
					
					for (const player of game.players) {
						console.log("starting player " + numRoles);
						await assignRoles(player, guild);
					}
                }
			break;
            // !refresh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'refresh':
				if (args.length != 0 && playGroups[args[0]] != null) {
					game.playGroup = playGroups[args[0]]["players_" + game.players.number()];
					console.log(args[0] + " play group selected");
				} 
                rolesIG=[];
				if (pleaseConfirm && isUserHost) {
					selectRoles(guild, game.players.number());
				}
                isDrunk = false;
			break;
			// !test~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'test':
				if (isUserHost) {
					let numPlayer = 6;
					if (args.length != 0 ) {
						numPlayer = parseInt(args[0]);
					}
					game.players.number = function() { return numPlayer; };
					console.log("Number of players set to: " + game.players.number());
				}
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clear':
				if (isUserHost || !game.isStarted) {
					endGame(guild);  
				}
			break;
			case 'playgroup':
				let playGroup;
				if (args.length > 1 ) {
					playGroup = playGroups[args[1]]["players_" + parseInt(args[0])];
				}
				else if (args.length > 0) {
					playGroup = playGroups["normal"]["players_" + parseInt(args[0])];
				}
				else if (game.playGroup != null) {
					playGroup = game.playGroup;
				}
				else {
					playGroup = playGroups["normal"]["players_6"];
				}
				
				printPlayGroup(channel, playGroup);
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
                        .addField("!night", "Set's the time to night and mutes all players in the voice channel and open the night text channels.")
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
						.addField("!action text", "Sends the passed text to the host")
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
			break;
			default:
				msg.reply(cmd + ' is not a valid command. Use !help for more information!');
			break;
		}
		msg.delete(1000);
	}
    else if (user.id == '230433217147043840') {
        msg.delete(1000);
    }
});

//Begins the process of starting a game by inviting players to join
async function invitePlayers(guild, host) {
	console.log("\n\nInviting Players");
	game.isActive = true;
	fillDiscordRoles(guild);
	host.addRole(discordRoles.Host).catch(console.error);			
	await createChannel(guild, discordChannels.join);
	await createChannel(guild, discordChannels.host);
    await updateJoinEmbed();
    joinMessage = await guild.channels.find(channel => channel.name === "join_game").send(embedMSG);
}

//Starts the game
//Creates all game channels
function startGame(guild) {
	console.log("\n" + "Starting Game");
	
    console.log("Players Alive: " + game.players.alive());
	game.isStarted = true;
	game.isDay = true;
    selectRoles(guild, game.players.number());
	
    game.players.forEach(user => createUserChannels(user, guild));
	
	createChannel(guild, discordChannels.day).then( () => {
		printPlayGroup(game.channels.day, game.playGroup);
	});
	
	createChannel(guild, discordChannels.dead);
	createChannel(guild, discordChannels.voice).then(channel => {
        //Moves all people from day-vice to General
		let generalVoice = guild.channels.find(channel => channel.name === "General");
		let dayVoice = guild.channels.find(channel => channel.name === "voice");
		moveVoiceChannels(generalVoice, dayVoice);
    });
	
	game.channels.join_game.delete();
}

//clears the game variables to begin setting up a new game
function newGame() {
	game = new Object();
	game.channels = new Object;
	game.players = new Array();
	game.players.number = function() {
		return game.players.length;
	}
	game.players.alive = function() {
		let numberAlive = 0;
		game.players.forEach(player => {
			if (player.isAlive) {numberAlive++;}
		});
		return numberAlive;
	}
	game.roles = new Array();
	game.actions = null;
	game.isActive = false;
	game.isStarted = false;
	game.isDay = false;
	
	game.addPlayer = function(player) {
		player.isAlive = true;
		player.action = "";
		game.players.push(player);
	}
	
	game.updateActions = async function() {
		let embed = new Discord.RichEmbed()
		.setTitle("Player Actions")
		.setColor(0x8eb890);
		
		game.players.forEach(player => {
			embed.addField(player.displayName + " - " + player.role.roleName, "Action: " + player.action);
		});
		
		if (game.actions == null) {
			console.log("sending message");
			game.actions = await game.channels.host.send(embed);
		}
		else {
			console.log("Editing message");
			game.actions.edit(embed);
		}
	}
}

//ends the game
async function endGame(guild) {
	console.log("\n" + "Clearing game");
    isDrunk = false;
	vote = null;
	
	nominate.nominations = new Object();
	nominate.accused = new Object();
	nominate.embed = new Discord.RichEmbed();
	nominate.message = null;
	updateNominateEmbed();
	
	let generalVoice = guild.channels.find(channel => channel.name === "General");
	let gameVoice = await guild.channels.find(channel => channel.name === "voice");
	if ( gameVoice != null) {
		await moveVoiceChannels(gameVoice, generalVoice);
	}
	
	//Deletes all game channels
	Object.values(discordChannels).forEach( async (obj) => {
		let channel = await guild.channels.find(channel => channel.name === obj.name);
		if (channel != null) { 
			channel.delete().catch(function(error) {
			  console.error(error);
			});
		}
	});

	//removes the game roles from every member
    await guild.fetchMembers().then(r => {
		r.members.array().forEach(user => {
			removeUserChannels(user,guild);
		});
	});

	rolesIG = new Array();
	discordRoles = null;
	
	newGame();
}

//Creates a privte channel for each player and the host
function createUserChannels(user, guild){
	let channelObj = new Object();
	channelObj.name = user.displayName;
	channelObj.type = discordChannels.template.type;
	channelObj.message = "This is your personal channel for communicating with the host, and for using commands";
	channelObj.permissions = discordChannels.template.permissions;
	channelObj.rolePermission = discordChannels.template.rolePermission;
	
	createChannel(guild, channelObj).then( () => {
		let channel = game.channels[user.displayName];
		channel.overwritePermissions(user, discordChannels.template.rolePermission);
		game.channels[user.displayName] = channel;
		user.channel = channel;
	}).catch(function(err) {
			console.log("Error on user: " + user.displayName)
		});
}

//Deletes individual channels, and removes game roles
function removeUserChannels(user,guild){
	let channel = guild.channels.find(channel => channel.name === user.displayName.toLowerCase());
	if (channel != null) {
		channel.delete();
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

//Selects the passed Play Group.
async function printPlayGroup(channel, playGroup){
	let string = "For " + playGroup.length + " players, the game includes: \n" ;
	playGroup.forEach(role => {
		string += role.Main;
		if (role.Sub != null && role.Sub != "Werewolf" ) {	string += " " + role.Sub;	}
		string += "\n";
	});
	channel.send(string);
}

//Selects the roles based on the number of players.
function selectRoles(guild, players) {
	game.playGroup.forEach(role => {
		let roleType = roleData[role.Main];
		if (role.Sub != null) {	roleType =  roleType[role.Sub];	}
		randomRole(roleType);
	});
	
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
async function assignRoles(user, guild){
	console.log(Object.keys(game.channels));
	user.role = rolesIG[numRoles];
	user.channel.send("Your role is:");
	printRole(rolesIG[numRoles], user.channel);
	
	if (rolesIG[numRoles].channels != null) {
		for (channelName of rolesIG[numRoles].channels) {
			if (game.channels[channelName] == null) {
				await createChannel(guild, discordChannels[channelName]).then( () => {
					game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
				});
			}
			else {
				game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
			}
		}
	}
	
	if (rolesIG[numRoles].altRole != null) {
		let altRole = roleCheck(rolesIG[numRoles].altRole);
		if (altRole.channels != null) {
			for (channelName of altRole.channels) {
				if (game.channels[channelName] == null) {
					await createChannel(guild, discordChannels[channelName]);
				}
			}
		}
	}
	
	console.log("finishing player " + numRoles);
	numRoles ++;
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

async function updateJoinEmbed() {
    if(game.players.number() <= 6){
        embedMSG = await new Discord.RichEmbed()
            .setTitle('Lobby')
            .setColor(0x8eb890)
            .addField("Players In Lobby","Players: \n" + game.players.join("\n"))
            .addField("Number of Players", game.players.number()+"/6 Players");
    }
    else{
        embedMSG = await new Discord.RichEmbed()
            .setTitle('Lobby')
            .setColor(0x8eb890)
            .addField("Players In Lobby","Players: " + game.players.join("/n"))
            .addField("Number of Players", game.players.number()+" Players");
    }  
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
		
	
	for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
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
    for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
        if(channelMember[1].roles.has(discordRoles.Town.id)){
            channelMember[1].setMute(false)
        }
    }
    setTimeout(muteAllVote,50000,guild);    
}

function muteAllVote(guild){
    guild.channels.find(channel => channel.name === "day").send("Everyone must now vote! Either !guilty | !innocent | !abstain");
    for (let channelMember of guild.channels.find(channel => channel.name === "voice").members) {
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
  myVar = setTimeout(function(){ unMuteTown(guild); }, 50000);
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

function createChannel(guild, channelObj) {
	return guild.createChannel(channelObj.name, channelObj.type).then(channel => {
		game.channels[channelObj.name] = channel;
		console.log("made " + channelObj.name + " channel");
		if (channelObj.message!=null) {
			channel.send(channelObj.message);
		}
		let permissions = discordChannels.template.permissions.concat(channelObj.permissions);
		
		permissions.forEach(perm => {
			channel.overwritePermissions(discordRoles[perm.role], perm.permission);
		});
	}).catch(console.error);
}
