const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if(message.author.bot)  { return; }
  let content = message.content;
  let command = content.split(" ")[0];

  if(!command.startsWith("/")) { return; }
  let rawCaption = content.slice(command.length + 1, content.length);

  if (rawCaption.length === 0) { return; }
  processCommand(command, '', rawCaption, (response) => {
    message.reply(response)
  });
});
client.login(process.env.TOKEN);

function processCommand(command, templateid, caption, callback) {
  request.post(process.env.caption_url, {json: {'command': command, 'templateid': templateid, 'caption': caption}, headers: {'x-api-key': process.env.api_key}}, (error, httpResponse, body) => {
    return callback(JSON.parse(response))
  });
}