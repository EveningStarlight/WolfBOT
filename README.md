# WolfBOT

A bot that runs games of werewolf on a server

## Running the bot

1. Clone the repo to your machine

2. download node modules using `npm install`

3. Make sure you have a bot set up

4. run the bot using `node index.js`

## Setting up the bot

1. Create a bot

2. Create an .env file and add the token there

```
TOKEN=Example.token.here

```

3. Permission the bot with Admin privilege

## Adding new slash commands

Commands must be registered before they can be run. You must reregister if the name or description changes. Changing the interaction can be done without registering.

Changes to global slash commands is slower than to a specific guild

https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands

1. Add the client (application) id and the guild id to the env

2. add the command to the commands folder. It must contain a name, description, and an interaction

3. Register the new commands by running `node deploy-commands.js`.
