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

//create redis connection
const redisClient = require('redis').createClient(process.env.REDIS_URL);

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

redisClient.on('connect', function() {
  console.log('redis connected');
});

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
  console.log("message data",mesage);
  var msg = message.text.toLowerCase();
  console.log("message",msg);
  storage.push(msg);

  //check if user want to register

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
    case 'register team':
      return replyText(replyToken, "Silahkan masuk kata rahasia yang terdapat pada kartu");
    case 'input keywords':
      return replyText(replyToken, "Silahkan masuk kata rahasia yang terdapat pada kartu");
    case 'guess heroes':
      // let hasTeam = false;
      // for(let g=0; g<storage.length; g++) {
      //   if(storage[g] == 'profile') {
      //     hasTeam = true;
      //     break;
      //   }
      // }
    
      // if(!hasTeam)
      //   return replyText(replyToken, "Silahkan masukkan nama team terlebih dahulu (ketik profile)");
      // else
      //   return replyText(replyToken, "Silahkan masukkan jawaban kamu.\n INGAT! Kami hanya menerima jawaban pertama ya");
      return createHeroesCarousel(replyToken);
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

function createHeroesCarousel(replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'template',
      altText: 'Heroes Menu',
      template: {
        type: 'carousel',
        columns: [
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero A',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero A', type: 'postback', data: 'HEROA', text: 'Guess Hero A'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero B',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero B', type: 'postback', data: 'HEROB', text: 'Guess Hero B'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero C',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero C', type: 'postback', data: 'HEROC', text: 'Guess Hero C'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero D',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero D', type: 'postback', data: 'HEROD', text: 'Guess Hero D'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero E',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero E', type: 'postback', data: 'HEROE', text: 'Guess Hero E'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero F',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero F', type: 'postback', data: 'HEROF', text: 'Guess Hero F'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero G',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero G', type: 'postback', data: 'HEROG', text: 'Guess Hero G'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero H',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero H', type: 'postback', data: 'HEROH', text: 'Guess Hero H'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero I',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero I', type: 'postback', data: 'HEROI', text: 'Guess Hero I'},
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero J',
            text: 'Guesx This Hero?',
            actions: [
              { label: 'Guess Hero J', type: 'postback', data: 'HEROJ', text: 'Guess Hero J'},
            ],
          },
        ],
      },
    }
  );
}

function handleImage(message, replyToken) {
  // const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  // const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
  //     // ImageMagick is needed here to run 'convert'
  //     // Please consider about security and performance by yourself
  //     cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

  //     return client.replyMessage(
  //       replyToken,
  //       {
  //         type: 'image',
  //         originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
  //         previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
  //       }
  //     );
  //   });
}

function handleAudio(message, replyToken) {
  // const downloadPath = path.join(__dirname, 'static/music/Ajoin.mp3', `${message.id}.m4a`);

  // return downloadContent(message.id, downloadPath)
  //   .then((downloadPath) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl: baseURL + 'static/music/test.mp4',
          duration: 7000
        }
      );
    // });
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
