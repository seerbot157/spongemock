const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const express = require('express');

let app = express();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if(message.author.bot)  { return; }
  let content = message.content;
  let command = content.split(" ")[0];

  if(command !== '/mock') { return; }
  let rawCaption = content.slice(command.length + 1, content.length);

  console.log(rawCaption);
    if (rawCaption.length === 0) {
        message.reply('Usage: /mock <my caption>');
    } else {
      transformText(rawCaption, (transformed) => {
          generateImage(transformed, (url) => {
              message.reply(url);
          });
      });
    }
});

client.login(process.env.TOKEN);

function generateImage(caption, callback) {
  request.post('https://api.imgflip.com/caption_image',
    { form:
      { template_id: '102156234',
        username: process.env.IMGFLIP_UN,
        password: process.env.IMGFLIP_PW,
          boxes: [{
              text: caption,
              x: 10,
              y: 10,
              width: 475,
              height: 100,
              color: "#ffffff",
              outline_color: "#000000"
          }]
      }
    }, (error, httpResponse, body) => {
    let response = JSON.parse(body);
    return callback(response.data.page_url);
  });
}

function transformText(rawCaption, callback) {
  let transformed = '';
  for(let i = 0; i < rawCaption.length; i++) {
    if(i % 2 === 0) {
      transformed += rawCaption.charAt(i).toLowerCase();
    } else {
        transformed += rawCaption.charAt(i).toUpperCase();
    }
  }

  return callback(transformed);
}

let server = app.listen(process.env.PORT || 5000, () => {
    let port = server.address().port;
    console.log('spongemock up on port ' + port);
});