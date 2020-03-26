const Discord = require('discord.js');
const fs = require('fs');
const fetch = require("node-fetch");
const client = new Discord.Client();
client.login(JSON.parse(fs.readFileSync('loginToken.json')).token);

var roleData
client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("villagers", {type: 'WATCHING'});
  roleData = JSON.parse(fs.readFileSync('roles.json'));
});

//The List of recognized commands
var commandWordsBasic = ["ping", "start", "play", "lynch", "help"];
var commandWordsHost = ["day", "night", "kill", "clear", "test"];
var commandWords = commandWordsBasic.concat(commandWordsHost);

//used to determin if there is already an active game or not.
var isActiveGame = false;
var isGameStarted = false;
var rolesIG=[];
//Used to determin if it is day or night
var isDay = true;

//Used for confirming the bots selection of roles
var rolesConfirmed = false;
var pleaseConfirm = false;

var numPlayer = 0;
var nominated = [];
var numRoles = 0;
var count = 0;
//An array of all the roles that are used in the game
var roleArray = new Array();

//This listens to every message posted in the guild, and checks to see if it is a command
client.on('message', async msg => {  

	const message = msg.content;
	const channel = msg.channel;
	const user = msg.member;
	const guild = msg.guild;
	const isUserHost = user.roles.has((guild.roles.find(role => role.name === "Host")).id);
    
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
			break;
            // !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clean':
                if(user.roles.has(msg.guild.roles.find(role => role.name === "mod").id)){
                    clearChannel(channel);
                }
            break;
			// !play~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'letmein':
				if (10 > Math.floor(Math.random()*100)) {
					msg.reply("No");
				}
			case 'play':
			case 'join':
				if (isActiveGame && !isGameStarted && !user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)){
                    numPlayer += 1;
					var villagerRole = guild.roles.find(role => role.name === "Town");
				    user.addRoles([villagerRole]).catch(console.error);
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
					user.addRoles([ghostRole]).catch(console.error);
					msg.delete(1000);
				}
                else if (user.roles.has(msg.guild.roles.find(role => role.name === "Town").id)){
                    channel.send(user + ", you are already in the game!");
                }
			break;
			// !day~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
			// !night~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

						await killedVillager.removeRole(villagerRole).catch(console.error);

						killedVillager.addRoles([ghostRole]).catch(console.error);
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
				if (pleaseConfirm && isUserHost) {
                    numRoles = 0;
				    const everyone = guild.fetchMembers().then(r => {
		              r.members.array().forEach(user => assignRoles(user,guild));
                    });	
				}
			break;
            // !refresh~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'refresh':
                rolesIG=[];
				if (pleaseConfirm && isUserHost) {
					selectRoles(guild,roleData);
				}
			break;
			// !mute~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            case 'mute':

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
				
			break;
			// !clear~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			case 'clear':
				if (isUserHost) {
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

//Begins the process of starting a game by inviting players to join
function invitePlayers(guild, host) {
	console.log("Inviting Players");
	isActiveGame = true;
	
	const hostRole = guild.roles.find(role => role.name === "Host");
	const everyoneRole = guild.roles.find(role => role.name === "@everyone");	
	
	host.addRole(hostRole).catch(console.error);			
	fillRoleArray(guild);
	
    guild.createChannel('join-game','text').then(channel => {
        channel.send("@here, " + host.toString() + " wants to start a game, please message !play if you want to join")}).catch(console.error);
		
    guild.createChannel('host','text').then(channel => {
        channel.send("This channel is for hosts to mesage the bot privatly");
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
        channel.overwritePermissions(hostRole, { VIEW_CHANNEL: true });
    });
}

//Starts the game
//Creates all game channels

function startGame(guild,data) {
	console.log("Starting Game");
	
	const villagerRole = guild.roles.find(role => role.name === "Town");
    const everyoneRole = guild.roles.find(role => role.name === "@everyone");
	const ghostRole = guild.roles.find(role => role.name === "Dead");
	
	
	isGameStarted = true;
	isDay = true;
    selectRoles(guild,data);
	
    guild.fetchMembers().then(r => {
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
    });

    guild.createChannel('dead','text').then(channel => {
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
        channel.overwritePermissions( 
		ghostRole, 
		{	VIEW_CHANNEL: true,
			SEND_MESSAGES: true});
    });
    
    guild.createChannel('night-werewolf','text').then(channel => {
        channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
    });
    
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
    });
	
    guild.channels.find(channel => channel.name === "join-game").delete();
}

//Ends the game, cleans up roles, cleares used channels
function endGame(guild) {
	console.log("Clearing game");
	isActiveGame = false;
	isGameStarted = false;
	//removes the game roles from every member

    /*
    var everyone = guild.fetchMembers().then(r => {

        r.members.array().forEach(user => getOutHere(user,guild))
	});
    /*
    new Promise(function( accept, reject ) {
       try {
          if (getOuttaHere(guild)) { 
            accept(guild);
          }
       } catch (exception) {
          reject(exception);
       }
    }).then(delChannel).catch(err => console.log(err));
    */
    
    getOuttaHere(guild);
    rolesIG = new Array();
    numPlayer = 0;
    var hostRole = guild.roles.find(role => role.name === "Host");
    	
	const villagerRole = guild.roles.find(role => role.name === "Town");
	const ghostRole = guild.roles.find(role => role.name === "Dead");
    /*
    const promise1 = new Promise(function(getOutHere) {
        
      getOutHere(guild);
        
    });

    promise1.then(function() {
        
        delChannel(guild);
        
    });
    
    let general = guild.channels.find(channel => channel.name === "General");
    
    for (let channelMember of guild.channels.find(channel => channel.name === "day-voice").members) {
        if(channelMember[1].roles.has(villagerRole.id) || channelMember[1].roles.has(hostRole.id)){
            channelMember[1].setVoiceChannel(general);
        }
    }

    
    
    const channelMember = guild.channels.find(channel => channel.name === "day-voice").then(r => {
        r.members.forEach(user => assignRoles(user,guild));
    });	
    
    
    
    ['aaa','bbb','ccc'].forEach(function(name){
    calls.push(function(callback) {
        conn.collection(name).drop(function(err) {
            if (err)
                return callback(err);
            console.log('dropped');
            callback(null, name);
        });
    }
    )});
    
    async.parallel(function, function(err,result)){
        
        
    }
    */
    
	guild.channels.find(channel => channel.name === "host").delete();
    guild.channels.find(channel => channel.name === "dead").delete();
    guild.channels.find(channel => channel.name === "night-werewolf").delete();
    guild.channels.find(channel => channel.name === "day").delete();
	guild.channels.find(channel => channel.name === "day-voice").delete();
	
	const villagerRole = guild.roles.find(role => role.name === "Town");
	const ghostRole = guild.roles.find(role => role.name === "Dead");

	roleArray = new Array();
}


function doTheyMatch(item,name){
    
}


//Creates a privte channel for each player and the host
function createUserChannels(user,guild){
    const everyoneRole = guild.roles.find(role => role.name === "@everyone");
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id)){
        guild.createChannel(user.displayName,'text').then(channel => {
            channel.overwritePermissions(everyoneRole, { VIEW_CHANNEL: false });
            channel.overwritePermissions(user, { VIEW_CHANNEL: true });

        });
    }
}

//Deletes individual channels, and removes game roles
function removeUserChannels(user,guild){
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id) || user.roles.has(guild.roles.find(role => role.name === "Dead").id)){
        guild.channels.find(channel => channel.name === user.displayName.toLowerCase()).delete();
    }
    roleArray.forEach(role => {
		user.removeRole(role).catch(console.error);
	})
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

//Selects the roles based on the number of players.
function selectRoles(guild){
	var chanHost = guild.channels.find(channel => channel.name === "host");
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
			pleaseConfirm = true;
			var str = "The role list is as follows:\n";
			for (var i=0; i<rolesIG.length; i++) {
				str += rolesIG[i].roleName + "\n";
			}
			str += "If that is okay type !confirm if not type !refresh.";
			chanHost.send(str);
			shuffle(rolesIG);
        }
}

//Selects a random role from the passed data
function randomRole(array) {
	if (Array.isArray(array)) {
		let rando = Math.floor(Math.random()*array.length);
		rolesIG.push(array[rando]);
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
    if (user.roles.has(guild.roles.find(role => role.name === "Town").id)){
        guild.channels.find(channel => channel.name === user.displayName.toLowerCase()).send(
			"Your role is: "+rolesIG[numRoles].roleName+"\n" + 
			"You do: "+rolesIG[numRoles].description
		);
		
		//This gives access to the werewolf channel if a role should have access to it
        if(rolesIG[numRoles].category.includes('Werewolf') || rolesIG[numRoles].roleName == "Lone Wolf" || rolesIG[numRoles].roleName == "White Wolf" || rolesIG[numRoles].roleName == "Undercover Wolf" && rolesIG[numRoles].roleName != "Sorcerer" && rolesIG[numRoles].roleName != "Gremlin" && rolesIG[numRoles].roleName != "Harpy" && rolesIG[numRoles].roleName != "Nightmare" && rolesIG[numRoles].roleName != "Mystic Hunter" && rolesIG[numRoles].roleName != "Sloppy Executioner" && rolesIG[numRoles].roleName != "Dream Wolf") {
            guild.channels.find(channel => channel.name === "night-werewolf").overwritePermissions(user, { VIEW_CHANNEL: true });
        }
		
        numRoles ++;
    }
}

//This moves everyone from the general voice vhannel to the passed voice channel
function everyoneGetInHere(guild,channel){
    var villagerRole = guild.roles.find(role => role.name === "Town");
    var hostRole = guild.roles.find(role => role.name === "Host");

    let general = guild.channels.find(channel => channel.name === "General");
    
    for (let channelMember of general.members) {
        if(channelMember[1].roles.has(villagerRole.id) || channelMember[1].roles.has(hostRole.id)){
            channelMember[1].setVoiceChannel(channel);
        }
            
    }
    
}

function getOutHere(user, guild){
    
    var hostRole = guild.roles.find(role => role.name === "Host");
    	
	const villagerRole = guild.roles.find(role => role.name === "Town");
	const ghostRole = guild.roles.find(role => role.name === "Dead");

    let general = guild.channels.find(channel => channel.name === "General");
    
    if(user.roles.has(villagerRole.id) || user.roles.has(hostRole.id) || user.roles.has(ghostRole.id)){
        user.setVoiceChannel(general);
    }
}

async function getOuttaHere(guild){
    var villagerRole = guild.roles.find(role => role.name === "Town");
    var hostRole = guild.roles.find(role => role.name === "Host");
    var deadRole = guild.roles.find(role => role.name === "Dead");

    let general = guild.channels.find(channel => channel.name === "General");
    let voiceChannel = guild.channels.find(channel => channel.name === "day-voice");
    
    for await (let channelMember of voiceChannel.members) {
        
        if(channelMember[1].roles.has(villagerRole.id) || channelMember[1].roles.has(hostRole.id) || channelMember[1].roles.has(deadRole.id)){
           // console.log("Moved Over");
            //console.log(voiceChannel.members.array())
            await channelMember[1].setVoiceChannel(general).then(() => console.log("worked 1"));;
            await channelMember[1].setMute(false).then(() => console.log("worked 2"));;
            console.log("Yeet")
        }

            
    }
    delChannel(guild);
    
}

function delChannel(guild){
    
    guild.channels.find(channel => channel.name === "day-voice").delete();
    
    var everyone = guild.fetchMembers().then(r => {
		r.members.array().forEach(user => removeUserChannels(user,guild))
	});
    
    console.log("Yote");

    
}

//This writes roles from the role array to a new formatted JSON
function writeRoles() {
	var allRoles = new Object();
	
	var village = new Object();
	allRoles.Village = village;
	
	village.Villager = new Array();
	village.Villager.push(roleData[124]);
	village.Seer = new Array();
	village.Seer.push(roleData[37]);
	
	var villageNegative = new Array();
	fillArray(villageNegative, "Village Negative");
	village.Negative = villageNegative;
	
	var villageSupport = new Array();
	fillArray(villageSupport, "Village Support");
	village.Support = villageSupport;
	
	var villageProtective = new Array();
	fillArray(villageProtective, "Village Protective");
	village.Protective = villageProtective;
	
	var villageInvestigative = new Array();
	fillArray(villageInvestigative, "Village Investigative");
	village.Investigative = villageInvestigative;
	
	var villageKilling = new Array();
	fillArray(villageKilling, "Village Killing");
	village.Killing = villageKilling;
	
	var werewolf = new Object();
	allRoles.Werewolf = werewolf;
	
	werewolf.Werewolf = new Array();
	werewolf.Werewolf.push(roleData[125]);
	
	var werewolfKilling = new Array();
	fillArray(werewolfKilling, "Werewolf Killing");
	werewolf.Killing = werewolfKilling;
	
	var werewolfSupport = new Array();
	fillArray(werewolfSupport, "Werewolf Support");
	werewolf.Support = werewolfSupport;
	
	var neutral = new Object();
	allRoles.Neutral = neutral;
	
	var neutralTrue = new Array();
	fillArray(neutralTrue, "True Neutral");
	neutral.True = neutralTrue;
	
	var neutralEvil = new Array();
	fillArray(neutralEvil, "Neutral Evil");
	neutral.Evil = neutralEvil;
	
	var neutralKilling = new Array();
	fillArray(neutralKilling, "Neutral Killing");
	neutral.Killing = neutralKilling;
	
	var vampire = new Object();
	allRoles.Vampire = vampire;
	
	vampire.vampire = new Array();
	vampire.vampire.push(roleData[38]);
	
	fs.writeFile("test.json", JSON.stringify(allRoles), function(err) {
		if (err) {
			console.log(err);
		}
	});
}

//This fills an array with all role types that match the given string
function fillArray(array, string) {
	roleData.forEach(roleThing => {
		if (roleThing.category.includes(string)) {
			array.push(roleThing);
		}});
}

