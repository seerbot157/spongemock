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
  command = command.substr(1);

  let reserved_commands = ['list', 'update', 'bind', 'unbind'];
  let rawCaption = content.slice(command.length + 1, content.length);
  if (rawCaption.length === 0 && !reserved_commands.includes(command)) { return; }

  processCommand(command, '', rawCaption, (response) => {
    let replies = [];
    let discordCharLimit = 3000;
    if(command === 'list' || command === 'update') {
      let listReply = '';
      response.forEach(function(template) {
        let iterativeText = template.templateid + '\t' + template.description + '\n';
        if(listReply.length + iterativeText.length < discordCharLimit) {
          listReply += iterativeText;
        }
        else {
          replies.push(listReply);
        }
      });
    }
    else if(command === 'bind' || command === 'unbind') {
      response.forEach(function(template) {
        replies += template.templateid + '\t' + template.command + '\n';
      });
    }
    else {
      let url = '';
      try {
        url = response['data']['url'];
        replies.push(url);
      }
      catch(error) {
        console.error(error);
        replies.push('Unexpected error');
      }    
    }
    replies.forEach((reply) => {
      message.reply(reply);
    });
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