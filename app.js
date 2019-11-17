const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if(message.author.bot)  { return; }
  let content = message.content;
  let splitInput = content.split(" ");
  let command = splitInput[0];
  if(!command.startsWith("/")) { return; }
  command = command.substr(1);
  let new_command = '';
  let rawCaption = '';

  if(command === 'bind') {
    new_command = splitInput[1];
    rawCaption = content.slice(command.length + new_command.length + 3, content.length);// absolute horror
  }
  else {
    rawCaption = content.slice(command.length + 1, content.length);
  }

  let reserved_commands = ['list', 'templates', 'update', 'bind', 'unbind'];
  if (rawCaption.length === 0 && !reserved_commands.includes(command)) { return; }

  processCommand(command, new_command, rawCaption, (response) => {
    let reply = '';
    if(command === 'list') {
      response.forEach(function(template) {
        if(template.command !== 'NONE') {
          reply += '/' + template.command + '\n';
        }
      });
    }
    else if(command === 'templates') {
      response.forEach(function(template) {
        reply += template.description + '\n';
      });
    }
    else if(command === 'bind' || command === 'unbind') {
      response.forEach(function(template) {
        reply += template.description + ' bound to ' + template.command + '\n';
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
    console.log(reply);
    message.reply(reply);
  });
});
client.login(process.env.token);

function processCommand(command, new_command, caption, callback) {
  const captionurl = process.env.caption_url;
  const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.api_key
  };
  const payload = JSON.stringify({
      "command": command,
      "new_command": new_command,
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