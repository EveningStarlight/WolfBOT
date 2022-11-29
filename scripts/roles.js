const Discord = require('discord.js');
const fs = require('fs');
const { MessageEmbed } = require('discord.js');

//ROLES SCRIPT
const seer = require('./roles/seer.js');
const cryogenicist = require('./roles/cryogenicist.js');
const arsonist = require('./roles/arsonist.js');
const massmurderer = require('./roles/massmurderer.js');
const plaguemaster = require('./roles/plaguemaster.js');
const rioters = require('./roles/rioters.js');
const amnesiac = require('./roles/amnesiac.js');
const geisha = require('./roles/geisha.js');
const guardianangel = require('./roles/guardianangel.js');
const auraseer = require('./roles/auraseer.js');
const dreamer = require('./roles/dreamer.js');
const oracle = require('./roles/oracle.js');
const tracker = require('./roles/tracker.js');
const watcher = require('./roles/watcher.js');
const harlot = require('./roles/harlot.js');
const bodyguard = require('./roles/bodyguard.js');
const chronomancer = require('./roles/chronomancer.js');
const hero = require('./roles/hero.js');
const escort = require('./roles/escort.js');
const spellcaster = require('./roles/spellcaster.js');
const transporter = require('./roles/transporter.js');
const sorcerer = require('./roles/sorcerer.js');
const sheddingwolf = require('./roles/sheddingwolf.js');
const concubine = require('./roles/concubine.js');
const gremlin = require('./roles/gremlin.js');
const mysticwolf = require('./roles/mysticwolf.js');
const witch = require('./roles/witch.js');
const nostradamus = require('./roles/nostradamus.js');
const beholder = require('./roles/beholder.js');
const werewolf = require('./roles/werewolf.js');
const hungerer = require('./roles/hungerer.js');
const vigilante = require('./roles/vigilante.js');
const hunter = require('./roles/hunter.js');

//ROLES JSON
let allRoles = new Array();
let roleData = JSON.parse(fs.readFileSync('roles.json'));
let roleSuper = Object.values(roleData);
let roleSub = new Array();
roleSuper.forEach(sup => {
    roleSub = roleSub.concat(Object.values(sup));
});
roleSub.forEach(sub => {
    allRoles = allRoles.concat(Object.values(sub));
});

let numRoles = 0;
let rolesIG=[];

//Selects a random role from the passed data
function randomRole(array) {
    if (Array.isArray(array)) {
        let rando = Math.floor(Math.random()*array.length);
        this.rolesIG.push(array[rando]);
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


module.exports = {numRoles,rolesIG,seer,cryogenicist,arsonist,massmurderer,plaguemaster,rioters,amnesiac,geisha,guardianangel,auraseer,dreamer,oracle,tracker,watcher,harlot,bodyguard,chronomancer,hero,escort,spellcaster,transporter,sorcerer,sheddingwolf,concubine,gremlin,mysticwolf,witch,nostradamus,beholder,werewolf,hungerer,vigilante,hunter,allRoles,roleData,roleSuper,roleSub,
    roleCheck: function (roleString) {
        for (let i = 0; i < allRoles.length; i++) {
            if (allRoles[i].roleName.toLowerCase() == roleString.toLowerCase()) {
                return allRoles[i];
            }
        }
        return null;
    },
    getAllRoleNames: function() {
        return allRoles.flat().map(({roleName})=> roleName)
    },
    getRoleEmbed: async function(role) {
        const embed = await new Discord.EmbedBuilder()
            .setTitle(role.roleName)
            .setColor(0x8eb890)
            .addFields(
                { name: 'Description', value: role.description },
                { name: 'Category', value: role.category },
                { name: 'Seen as', value: role.seenAs},
                { name: 'Objective', value: role.winCon },
            );
        return embed
    },
    printRole: async function (role, channel) {
        const embed = await this.getRoleEmbed(role)
        await channel.send({ embeds: [embed] });
    },
    assignRoles: async function (user, guild, game){
        user.role = this.rolesIG[numRoles];
        user.channel.send("Your role is:");
        this.printRole(this.rolesIG[numRoles], user.channel);
        console.log(user.displayName+" has been assigned "+this.rolesIG[numRoles].roleName);

        if(this.rolesIG[numRoles].roleName == "Spy" || this.rolesIG[numRoles].roleName == "Wolf Spy"){
            spyArray.push(user);
        }

        if (this.rolesIG[numRoles].channels != null) {
            for (channelName of this.rolesIG[numRoles].channels) {
                if (game.channels[channelName] == null) {
                    await createChannel(guild, discordChannels[channelName]).then( () => {
                        game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
                        if(user.role.category == "Werewolf Support"){
                            game.channels[channelName].overwritePermissions(user, discordChannels[channelName].supportPermission);
                        }
                    });
                }
                else {
                    game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
                    if(user.role.category == "Werewolf Support"){
                        game.channels[channelName].overwritePermissions(user, discordChannels[channelName].supportPermission);
                    }
                }
            }
        }

        if (this.rolesIG[numRoles].altRole != null) {
            let altRole = this.roleCheck(this.rolesIG[numRoles].altRole);
            if (altRole.channels != null) {
                for (channelName of altRole.channels) {
                    if (game.channels[channelName] == null) {
                        await createChannel(guild, discordChannels[channelName]);
                    }
                }
            }
        }
        numRoles ++;
    },
    selectRoles: function (guild, game) {
        game.playGroup.forEach(role => {
            if(role.Role != null){
                this.rolesIG.push(this.roleCheck(role.Role));
            }
            else if(role.Main == 'Any'){
               let randomNum = Math.floor(Math.random()*100);
                if(randomNum <= 55){
                    randomRole(this.roleData['Village']);
                }
                else if(randomNum <= 75){
                    randomRole(this.roleData['Werewolf']);
                    wolfGame = true;
                }
                else{
                    randomRole(this.roleData['Neutral']);
                }
            }
            else{
                let roleType = this.roleData[role.Main];
                if (role.Sub != null && role.Sub != 'Random') {	roleType =  roleType[role.Sub];	}
                randomRole(roleType);
            }
            if(role.Main == 'Werewolf'){
                wolfGame = true;
            }

        });
        var str = "The role list is as follows:\n";
        for (var i=0; i<this.rolesIG.length; i++) {
            str += this.rolesIG[i].roleName + "\n";
        }
        str += "If that is okay type !confirm if not type !refresh.";
        let chanHost = guild.channels.find(channel => channel.name === "host");
        chanHost.send(str);
        shuffle(this.rolesIG);
        return true;
    },
    changeRole: function (user,role,guild,game){
        if (role.channels != null) {
            for (channelName of role.channels) {
                if (game.channels[channelName] == null) {
                        createChannel(guild, discordChannels[channelName]).then( () => {
                        game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
                        if(role.roleName == "Werewolf"){
                            game.channels['werewolf'].send("```css\n"+user.displayName+" has become a Werewolf!```");
                        }
                    });
                }
                else {
                    game.channels[channelName].overwritePermissions(user, discordChannels[channelName].rolePermission);
                    if(role.roleName == "Werewolf"){
                        game.channels['werewolf'].send("```css\n"+user.displayName+" has become a Werewolf!```");
                    }
                }
            }
        }

        game.channels[user.displayName].send("```css\nYou have become a "+role.roleName+"!```");
        game.players.forEach(player => {
            if(player.id === user.id){
                player.role = role;
            }
        });;
        console.log(user.displayName+" has been changed to "+role.roleName);
    }
};
