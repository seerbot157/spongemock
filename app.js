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
client.login(process.env.token);

function processCommand(command, templateid, caption, callback) {
  console.log(command);
  console.log(templateid);
  console.log(caption);
  const captionurl = process.env.caption_url;
  const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.api_key
  };

  const payload = JSON.stringify({
      "command": command,
      "templateid": templateid,
      "caption": caption
  });

  const options = {
      url: captionurl,
      headers: headers,
      method: "POST",
      body: payload,
      json: true
  };

  request(options, function (error, response, body) {
      console.log(body.received);
      console.log(response);
      return callback(JSON.parse(body))
  });
}