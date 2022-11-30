const Discord = require('discord.js');
const fs = require('fs');

// Grab all the role files from the role directory
let roleJS = require('./roles/index.js');

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

const roleNames = allRoles.flat().map(({roleName})=> roleName).sort()

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

// Shuffles the Array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
	return array;
}


module.exports = {
    numRoles,
    rolesIG,
    roleJS,
    allRoles,
    roleData,
    roleSuper,
    roleSub,
    roleCheck: function (roleString) {
        for (let i = 0; i < allRoles.length; i++) {
            if (allRoles[i].roleName.toLowerCase() == roleString.toLowerCase()) {
                return allRoles[i];
            }
        }
        return null;
    },
    getAllRoleNames: function() {
        return roleNames
    },
    getFilteredRoleNames: function(keyword) {
        return roleNames.filter(function (role) {
            return role.toLowerCase().includes(keyword.toLowerCase())
        })
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
    /*
    assignRoles: async function (user, guild, game){
        user.role = this.rolesIG[numRoles];
        user.channel.send("Your role is:");
        this.printRole(this.rolesIG[numRoles], user.channel);
        console.log(user.displayName+" has been assigned "+this.rolesIG[numRoles].roleName);

        const spyArray = []
        if(this.rolesIG[numRoles].roleName == "Spy" || this.rolesIG[numRoles].roleName == "Wolf Spy"){
            spyArray.push(user);
        }

        if (this.rolesIG[numRoles].channels != null) {
            for (const channelName of this.rolesIG[numRoles].channels) {
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
        });
        console.log(user.displayName+" has been changed to "+role.roleName);
    }
    */
};
