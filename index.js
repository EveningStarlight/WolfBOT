const { Client, GatewayIntentBits } = require('discord.js')
require('dotenv/config')
const rolesFile = require('./scripts/roles.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

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


client.on('ready', () => {
  console.log('The bot is ready')
    
    client.user.setPresence({
        game: {
            name: activities_list[0],
            type: types_list[0]
        }});
    setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
        client.user.setPresence({
        game: {
            name: activities_list[index],
            type: types_list[index]
        }});
    }, 10000);
})

client.on('messageCreate', (message) => {
    
  const channel = message.channel;
    
  if (message.content.substring(0, 1) == '!') {
      var args = message.content.substring(1).split(' ');
      var cmd = args[0];
      cmd = cmd.toLowerCase();
      if (cmd === 'ping') {
        message.reply('pong')
      }
      else if(cmd === 'role'){
        role = rolesFile.roleCheck(message.content.slice(6));
        if (role != null) {
            rolesFile.printRole(role, channel);
        }
      }
    }
})

client.login(process.env.TOKEN)
