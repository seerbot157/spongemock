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
  command = command.substr(1);

  processCommand(command, '', rawCaption, (response) => {
    let reply;
    if(command === 'list' || command === 'update') {
      response.forEach(function(template) {
        reply += template.templateid + '\t' + template.description + '\n';
      });
    }
    else if(command === 'bind' || command === 'unbind') {
      response.forEach(function(template) {
        reply += template.templateid + '\t' + template.command + '\n';
      });
    }
    else {
      try {
        reply = response['data']['url'];
      }
      catch(error) {
        console.error(error);
        reply = 'Unexpected error';
      }    
    }
    message.reply(reply)
  });
});
client.login(process.env.token);

function processCommand(command, templateid, caption, callback) {
  const captionurl = process.env.caption_url;
  const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.api_key
  };
  const payload = JSON.stringify({
      "command": command,
      "templateid": templateid,
      "content": caption
  });
  console.log(payload);
  const options = {
      url: captionurl,
      headers: headers,
      method: "POST",
      body: payload
  };

  request(options, function (error, response, body) {
    if(!error && response.statusCode == 200) {
      console.log(body);
      return callback(JSON.parse(body));
    } else {
      console.log(body)
      return callback(response.statusCode);
    }
  });
}