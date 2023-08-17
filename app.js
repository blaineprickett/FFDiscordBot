const Discord = require("discord.js");
const config = require("./config");
const commands = require("./lib/commands");
const commandsList = require("./stats/commandsList.json");
const utilities = require("./lib/utilities");

const bot = new Discord.Client();

bot.on("message", (msg) => {
  if (!msg.content.startsWith("!")) return; // Return early if no command prefix

  const [messageCommand, ...messageArgsArray] = msg.content.split(" ");
  const messageArgs = messageArgsArray.join(" ").trim();
  
  const commandKey = messageCommand.toLowerCase();

  // Confirm if the command exists
  const validCommand = commands.hasOwnProperty(commandKey);
  
  // Check for minor typos in the command
  const suggestedCommand = utilities.checkMinorTypo(messageCommand.slice(1), commandsList);

  const messageObject = {
    user: msg.author,
    args: messageArgs,
    channel: msg.channel,
  };

  if (validCommand) {
    commands[commandKey](messageObject)
      .then((response) => {
        if (response.message) {
          if (response.channelName) {
            const channel = msg.guild.channels.cache.find(ch => ch.name === response.channelName);
            if (channel) channel.send(response.message);
          } else {
            msg.channel.send(response);
          }
        }
      })
      .catch((err) => {
        const errorMessage = err.message || err;
        msg.channel.send(errorMessage);
      });
  } else if (suggestedCommand) {
    msg.channel.send(`*Did you mean* \`${suggestedCommand}\` *?*`);
  }
});

bot.login(config.DiscordAPIToken);
