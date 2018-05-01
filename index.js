'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const mongoose = require('mongoose');
mongoose.connect("mongodb://admin:admin@ds251799.mlab.com:51799/heroku_00cdnffr");
const Answer = mongoose.model('answer', new mongoose.Schema({teamName: "string", answer: [new mongoose.Schema({heroId: "string", heroName: "string",timeStamp:"Number"})]}));

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
      }else {
        return handlePostBack(event.replyToken,data,event.source);
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

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
  var msg = message.text.toLowerCase();
  var msgWithData = "";

  if(msg.indexOf("register team") > -1) {
    msgWithData = msg;
    msg = "register team";
  }

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
    // case 'music':
    //   return handleAudio(message,replyToken);
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
                  { label: 'Start Quest', type: 'postback', data: 'start quest', displayText: 'Start Quest'},
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'Event Information',
                text: 'Discover the fun!',
                actions: [
                  { label: 'Yes, please!', type: 'postback', data: 'event information', displayText: 'Event Information' },
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

      if(source.userId) {
        let Player = mongoose.model('player', new mongoose.Schema({userId: "string", teamName: "string"}));
        let query = Player.find({userId:source.userId});
        query.exec((err,docs)=> {
          if(docs.length > 0) {
            return replyText(replyToken, ["Melody internal system indicated you already registered to team "+docs[0].teamName,
            "you can't register to more than 1 team"]);
          }else {
            let trimmed = msgWithData.replace("register team ","");
            
            redisClient.set(source.userId+"REGISTERTEAM",trimmed);
  
            return client.replyMessage(
              replyToken,
              {
                type: 'template',
                altText: 'Confirm alt text',
                template: {
                  type: 'confirm',
                  text: 'Are you sure want to register to team ' + trimmed + " ? This cant't be undone.",
                  actions: [
                    { label: 'Yes', type: 'postback', data: 'REGISTERTEAMYES' },
                    { label: 'No', type: 'postback', data: 'REGISTERTEAMNO' },
                  ],
                },
              });
            
          }
        })
      }
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

      if(msg.indexOf("clue") === 0) {
        //add clue for the team
        //we should check if it is valid clue
        //then flag the clue to the team and flag the clue to be unused anymore
        //if clue used or wrong one, return replyText(replyToken, "Sorry wrong clue");
        return replyText(replyToken, "Clue succesfully registered");
      }else{

      redisClient.get(client.userId+"ANSWERHERO",(err,redisData)=> {
        if(redisData){

          if(redisData === 'start') {
            redisClient.set(client.userId+"ANSWERHERO",message.text);
            return client.replyMessage(
              replyToken,
              {
                type: 'template',
                altText: 'Confirm alt text',
                template: {
                  type: 'confirm',
                  text: 'Are you sure want to answer the Hero as ' + message.text + " ?",
                  actions: [
                    { label: 'Yes', type: 'message', text: 'Yes!' },
                    { label: 'No', type: 'message', text: 'No!' },
                  ],
                },
              });
          }else {
            redisClient.del(source.userId+"ANSWERHERO");
            return replyText(replyToken, "Thanks for your answer, good luck!");
          }
        }
      });
      }

      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, ["Sorry, I can\'t understand this :'"]);
    }
  }
}

function createHeroesCarousel(replyToken) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;
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
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero A', type: 'postback', data: 'CLUEHEROA'},
              { label: 'Answer Hero A', type: 'postback', data: 'ANSWERHEROA'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero B',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero B', type: 'postback', data: 'CLUEHEROB'},
              { label: 'Answer Hero B', type: 'postback', data: 'ANSWERHEROB'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero C',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero C', type: 'postback', data: 'CLUEHEROC'},
              { label: 'Answer Hero C', type: 'postback', data: 'ANSWERHEROC'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero D',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero D', type: 'postback', data: 'CLUEHEROD'},
              { label: 'Answer Hero D', type: 'postback', data: 'ANSWERHEROD'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero E',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero E', type: 'postback', data: 'CLUEHEROE'},
              { label: 'Answer Hero E', type: 'postback', data: 'ANSWERHEROE'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero F',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero F', type: 'postback', data: 'CLUECLUEHEROF'},
              { label: 'Answer Hero F', type: 'postback', data: 'ANSWERHEROF'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero G',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero G', type: 'postback', data: 'CLUEHEROG'},
              { label: 'Answer Hero G', type: 'postback', data: 'ANSWERHEROG'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero H',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero H', type: 'postback', data: 'CLUEHEROH'},
              { label: 'Answer Hero H', type: 'postback', data: 'ANSWERHEROH'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero I',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero I', type: 'postback', data: 'HEROI'},
              { label: 'Answer Hero I', type: 'postback', data: 'ANSWERHEROI'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL,
            title: 'Musical Hero J',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero J', type: 'postback', data: 'HEROJ'},
              { label: 'Answer Hero J', type: 'postback', data: 'ANSWERHEROJ'}
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

function handlePostBack(replyToken,data,source) {
  if(data.indexOf("CLUEHERO") > -1) {
    return handleAudio(null, replyToken);
  }else if(data.indexOf("ANSWERHERO") > -1) {
    redisClient.set(source.userId+"ANSWERHERO","start");
    return replyText(replyToken, ["Please type your answer!"]);
  }else if(data.indexOf("REGISTERTEAM") > -1) {
    redisClient.get(source.userId+"REGISTERTEAM",(err,teamName)=> {
      if(teamName) {
        console.log("team Name",teamName);
        if(data === 'REGISTERTEAMYES') {
          let Player = mongoose.model('player', new mongoose.Schema({userId: "string", teamName: "string"}));
          return Player.create({userId: source.userId,teamName:teamName},(err)=> {
            console.log(err);
            return replyText(replyToken, ["Registration successfull"]);
          });
        }else {
          return replyText(replyToken, ["Registration canceled"]);
        }
        redisClient.del(source.userId+"REGISTERTEAM");
      }
    });
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
