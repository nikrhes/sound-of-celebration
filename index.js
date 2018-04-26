'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "sosRZw/s8YVEw2SLr8RHKcvREI4mEgChP8aBciK57EqzGIk+2OUOGl5WXLfseMKsJTzPI6p/PNoAXdFANn4VRgrHz0GibhVS9n+ZoHWSDE9QIDPoDg3GHm1rQwkjgei4jZnXZ5S1U7OqL8DPvZaDggdB04t89/1O/w1cDnyilFU=",
  channelSecret: "48e0da8814ae0085ad5f92fd8ff428fd",
};

// base URL for webhook server
const baseURL = "https://sound-of-celebration.herokuapp.com/";

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  console.log(req.body);
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

var storage = [];
// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// complex reply function
const multiReply = (token, objects) => {
  objects = Array.isArray(objects) ? objects : [objects];
  return client.replyMessage(
    token,
    objects.map((object) => {
      console.log(object);
      console.log(object.type);
      console.log(object.text);
      if(object.type == 'text') {
        type: 'text',
        object.text
      } else {
        object
      }
    })
  );
}

// =================================== Global Var ================================

// ===============================================================================

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'postback':{
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);
      // return handlePostBack(data, event.replyToken, event.source);
      break;
    }
    case 'message':{
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          // return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }
      break;
    }

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handlePostback(data, replyToken, source){
  return replyText(replyToken, 'asdfasdf');
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  var msg = message.text.toLowerCase();
  storage.push(msg);
  switch (msg) {
    case 'profile':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => {
            replyText(
              replyToken,
              [
                `Hi ${profile.displayName}\n Have a great melody today!`
              ]
            )
          });

        /* return client.getProfile(source.userId)
          .then((profile) => multiReply(
            replyToken, [
              {
                type: 'text',
                text: `Display name: ${profile.displayName}`,
              },
              {
                type: 'text',
                text: `Status message: ${profile.statusMessage}`,
              },
              {
                type: 'sticker',
                packageId: 1073,
                stickerId: 17961,
              },
              {
                type: 'template',
                altText: 'asking',
                template: {
                  type: 'confirm',
                  text: 'Am i Clever?',
                  actions: [
                    { label: 'Absolutely', type: 'message', text: 'Absolutely!' },
                    { label: 'Yes', type: 'message', text: 'Yes!' },
                  ],
                },
              }
            ]
          )); */
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');
      }
    
    case 'confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case 'music':
      return handleAudio(message,replyToken);
    case 'menu':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Main Menu',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'Heroes Quest',
                text: 'Finish to quest to find the missing heroes!',
                actions: [
                  { label: 'Start Quest', type: 'postback', data: 'start quest', text: 'Start Quest'},
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'Event Information',
                text: 'Discover the fun!',
                actions: [
                  { label: 'Yes, please!', type: 'postback', data: 'event information', text: 'Event Information' },
                ],
              },
            ],
          },
        }
      );
    case 'image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );
    case 'datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
    case 'imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
    case 'input keywords':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
          return replyText(replyToken, 'Leaving group')
            .then(() => client.leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, 'Leaving room')
            .then(() => client.leaveRoom(source.roomId));
      }
    case 'input keywords':
      return replyText(replyToken, "Silahkan masuk kata rahasia yang terdapat pada kartu");
    case 'guest heroes':
      let hasTeam = false;
      for(let g=0; g<storage.length; g++) {
        if(storage[g] == 'profile') {
          hasTeam = true;
          break;
        }
      }
    
      if(!hasTeam)
        return replyText(replyToken, "Silahkan masukkan nama team terlebih dahulu (ketik profile)");
      else
        return replyText(replyToken, "Silahkan masukkan jawaban kamu.\n INGAT! Kami hanya menerima jawaban pertama ya");
    case 'delete storage':
      storage = [];
      return replyText(replyToken, "Storage sudah bersih");
    case 'list of storage':
      if(storage.length == 0)
        return replyText(replyToken, "Tidak ada storage");
      else
        return replyText(replyToken, storage);
    default: {
      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, ["Sorry, I can\'t understand this :'", 
        "Type 'menu' to open Menu, or 'help' for further assistance : )"]);
    }
  }
}

function handleImage(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleVideo(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      // cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleAudio(message, replyToken) {
  // const downloadPath = path.join(__dirname, 'static/music/Ajoin.mp3', `${message.id}.m4a`);

  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl: baseURL + 'static/music/A join.mp3',
          duration: 15000,
        }
      );
    // });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
