'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const mongoose = require('mongoose');
mongoose.connect("mongodb://admin:admin@ds251799.mlab.com:51799/heroku_00cdnffr");
const playerSchema = new mongoose.Schema({userId: "string",userName:"string", teamName: "string"});
const clueSchema = new mongoose.Schema({heroId:"string",clueFragment: "string", active: "number"});
const teamClueSchema = new mongoose.Schema({heroId:"string",teamName:"string",clue:"string"});
const answerSchema = new mongoose.Schema({teamName: "string", userId: "string",heroId:"string",heroAnswer:"string",timestamp:"number"});
// mongoose.connect("mongodb://admin:admin@ds251799.mlab.com:51799/heroku_00cdnffr",{ keepAlive: 120 });
// const Player = mongoose.model('player', new mongoose.Schema({userId: "string", teamName: "string"}));
// const Answer = mongoose.model('answer', new mongoose.Schema({teamName: "string", answer: [new mongoose.Schema({heroId: "string", heroName: "string",timeStamp:"Number"})]}));

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
        console.log("data",data);
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

  if(msg.indexOf("player ready, team") > -1) {
    msgWithData = msg;
    msg = "player ready, team";
  }else if(msg.indexOf("we sing") > -1) {
    msgWithData = msg;
    msg = "we sing";
  }else if(msg.indexOf("sticker") > -1) {
    msgWithData = msg;
    msg = "sticker";
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
    case 'sticker':
      return client.replyMessage(replyToken, [
        {
          "type": "text",
          "text": "Why?!"
        },
        {
          "type": "sticker",
          "packageId": "1",
          "stickerId": "3"
        }
      ]);
    case 'player ready, team':

      if(source.userId) {
        try{
          let player = mongoose.model('players',playerSchema);
          let query = player.find({userId:source.userId});
          return query.exec((err,docs)=> {
            console.log("succesfully query");
            if(docs.length > 0) {
              return client.replyMessage(replyToken, [
              {
                "type": "text",
                "text": "You already registered to team "+ docs[0].teamName
              },
              {
                "type": "sticker",
                "packageId": "1",
                "stickerId": "119"
              }]);
            }else {
              let trimmed = msgWithData.replace("player ready, team ","");
              
              redisClient.set(source.userId+"REGISTERTEAM",trimmed);

              return client.replyMessage(
                replyToken,
                {
                  type: 'template',
                  altText: 'Confirm alt text',
                  template: {
                    type: 'confirm',
                    text: 'Are you sure want to register as team ' + trimmed + " ? This can't be undone.",
                    actions: [
                      { label: 'Yes', type: 'postback', data: 'REGISTERTEAMYES' },
                      { label: 'No', type: 'postback', data: 'REGISTERTEAMNO' },
                    ],
                  },
                });
            }
          })
        }catch(err) {
          console.log(err);
          return client.replyMessage(replyToken, [
            {
              "type": "text",
              "text": "Melody have so many things to do right now, please retry it again in few seconds"
            },
            {
              "type": "sticker",
              "packageId": "1",
              "stickerId": "113"
            }
          ]);
        }
      }
    case 'we sing':
      //add clue for the team
      //we should check if it is valid clue
      //then flag the clue to the team and flag the clue to be unused anymore
      //if clue used or wrong one, return replyText(replyToken, "Sorry wrong clue");

      let trimmed = msgWithData.replace("we sing ","");

      if(source.userId) {
        try{
          let clues = mongoose.model('clues',clueSchema);
          let query = clues.find({clueFragment:trimmed});
          return query.exec((err,docs)=> {
            console.log("succesfully query");
            if(docs.length > 0) {
              let clueFragment = docs[0];
              if(clueFragment.active === 1) {
                //clue is not being used

                clueFragment.set({ active: 0 });
                clueFragment.save(function (err, updatedClue) {
                  if(err) {
                    //do something if error
                    console.log(err);
                    return client.replyMessage(replyToken, [
                      {
                        "type": "text",
                        "text": "My bad, please try again..."
                      },
                      {
                        "type": "sticker",
                        "packageId": "1",
                        "stickerId": "111"
                      }
                    ]);
                  }

                  //update the clue list table of user 
                  let player = mongoose.model('players',playerSchema);
                  let query = player.find({userId:source.userId});
                  return query.exec((err,docs)=> {
                    console.log("succesfully query");
                    if(docs.length > 0) {
                      let clue = mongoose.model('team_clues',teamClueSchema);
                      return clue.create({heroId:clueFragment.heroId,teamName:docs[0].teamName,clue:trimmed},(err)=> {
                        console.log(err);
                        return replyText(replyToken, ["succesfully register the clue"]);
                      });
                    }else {
                      //error plaer not registered
                      return client.replyMessage(replyToken, [
                        {
                          "type": "text",
                          "text": "Sorry you are not registered as player"
                        },
                        {
                          "type": "sticker",
                          "packageId": "1",
                          "stickerId": "15"
                        }
                      ]);
                    }
                  })

                });
              }
              else {
                //the clue was used, sent error to user
                return client.replyMessage(replyToken, [
                  {
                    "type": "text",
                    "text": "Nice try, but the clue already used..."
                  },
                  {
                    "type": "sticker",
                    "packageId": "1",
                    "stickerId": "15"
                  }
                ]);
              }

            }else {
              return replyText(replyToken, ["You entered invalid clue. Please try again."]);
            }
          })
        }catch(err) {
          console.log(err);
          return replyText(replyToken, ["Melody have so many things to do right now, please retry it again in few seconds"]);
        }
      }

      return replyText(replyToken, "Clue succesfully registered");
    case 'player start':
      return createHeroesCarousel(replyToken);

    case 'yes!':
      return null;
    case 'no!':
      return null;
    default: {

      redisClient.get(source.userId+"ANSWERHERO",(err,redisData)=> {
        if(redisData){

          if(redisData.indexOf("ANSWERHERO") > -1) {
            redisClient.set(source.userId+"ANSWERHERO",redisData.split("|")[1]+"|"+message.text);
            return client.replyMessage(
              replyToken,
              {
                type: 'template',
                altText: 'Confirm alt text',
                template: {
                  type: 'confirm',
                  text: 'Are you sure want to answer Hero '+ redisData.split("|")[1] +' as ' + message.text + " ?",
                  actions: [
                    { label: 'Yes', type: 'postback', data: "HEROANSWEREDYES", text: 'Yes!' },
                    { label: 'No', type: 'postback', data: "HEROANSWEREDNO", text: 'No!' },
                  ],
                },
              });
          }
          // else {
          //   //save the answer into database
          //   redisClient.del(source.userId+"ANSWERHERO");
          //   return replyText(replyToken, "Thanks for your answer, good luck!");
          // }
        }
      });

      console.log(`Echo message to ${replyToken}: ${message.text}`);

      return client.replyMessage(replyToken, [
        {
          "type": "text",
          "text": "Don't ask me something that I don't understand..."
        },
        {
          "type": "sticker",
          "packageId": "1",
          "stickerId": "9"
        }
      ]);
    }
  }
}

function createHeroesCarousel(replyToken) {
  const buttonsImageURL = baseURL + 'static/buttons/';
  return client.replyMessage(
    replyToken,
    {
      type: 'template',
      altText: 'Heroes Menu',
      template: {
        type: 'carousel',
        columns: [
          {
            thumbnailImageUrl: buttonsImageURL + 'A.jpg',
            title: 'Musical Hero A',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero A', type: 'postback', data: 'CLUEHERO|A'},
              { label: 'Answer Hero A', type: 'postback', data: 'ANSWERHERO|A'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'B.jpg',
            title: 'Musical Hero B',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero B', type: 'postback', data: 'CLUEHERO|B'},
              { label: 'Answer Hero B', type: 'postback', data: 'ANSWERHERO|B'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'C.jpg',
            title: 'Musical Hero C',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero C', type: 'postback', data: 'CLUEHERO|C'},
              { label: 'Answer Hero C', type: 'postback', data: 'ANSWERHERO|C'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'D.jpg',
            title: 'Musical Hero D',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero D', type: 'postback', data: 'CLUEHERO|D'},
              { label: 'Answer Hero D', type: 'postback', data: 'ANSWERHERO|D'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'E.jpg',
            title: 'Musical Hero E',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero E', type: 'postback', data: 'CLUEHERO|E'},
              { label: 'Answer Hero E', type: 'postback', data: 'ANSWERHERO|E'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'F.jpg',
            title: 'Musical Hero F',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero F', type: 'postback', data: 'CLUECLUEHERO|F'},
              { label: 'Answer Hero F', type: 'postback', data: 'ANSWERHERO|F'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'G.jpg',
            title: 'Musical Hero G',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero G', type: 'postback', data: 'CLUEHERO|G'},
              { label: 'Answer Hero G', type: 'postback', data: 'ANSWERHERO|G'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'H.jpg',
            title: 'Musical Hero H',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero H', type: 'postback', data: 'CLUEHERO|H'},
              { label: 'Answer Hero H', type: 'postback', data: 'ANSWERHERO|H'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'I.jpg',
            title: 'Musical Hero I',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero I', type: 'postback', data: 'CLUEHERO|I'},
              { label: 'Answer Hero I', type: 'postback', data: 'ANSWERHERO|I'}
            ],
          },
          {
            thumbnailImageUrl: buttonsImageURL + 'J.jpg',
            title: 'Musical Hero J',
            text: 'Guess This Hero?',
            actions: [
              { label: 'Clue Hero J', type: 'postback', data: 'CLUEHERO|J'},
              { label: 'Answer Hero J', type: 'postback', data: 'ANSWERHERO|J'}
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

function handleAnswerAndClues(replyToken,hero,source) {
  let player = mongoose.model('players',playerSchema);
  let query = player.find({userId:source.userId});
  return query.exec((err,docs)=> {
    console.log("succesfully query");
    if(docs.length > 0) {
      let teamClues = mongoose.model('team_clues',teamClueSchema);
      console.log("hero",hero);
      console.log("team name",docs[0].teamName);
      let query = teamClues.find({heroId:hero,teamName:docs[0].teamName});
      return query.exec((err,docs)=> {
        console.log(err);
        console.log(docs);
        if(docs.length > 0){
          return handleClueFragment(replyToken,docs.length,hero);
        }else {
          //error lol
          return client.replyMessage(replyToken, [
            {
              "type": "text",
              "text": "you don't have any clue for this hero. What I suppose to do?"
            },
            {
              "type": "sticker",
              "packageId": "1",
              "stickerId": "16"
            }
          ]);
        }
      });
    }else {
      //error lol
      return client.replyMessage(replyToken, [
        {
          "type": "text",
          "text": "Sorry, I am sure you have not registered as player."
        },
        {
          "type": "sticker",
          "packageId": "1",
          "stickerId": "16"
        }
      ]);
    }
  });
}

function handleClueFragment(replyToken,clueCount,hero) {

  let music = null;
  let image = null;
  if(clueCount === 1) {
    music = {
      type: 'audio',
      originalContentUrl: baseURL + 'static/music/'+hero+'1.m4a',
      duration: 7000
    }
  }
  if(clueCount === 2) {

    if(hero === "A"||hero === "B"||hero === "G"||hero === "J") {
      image = {
        type: 'image',
        originalContentUrl: baseURL + '/static/images/'+hero+'_image.png',
        previewImageUrl: baseURL + '/static/images/'+hero+'_image.png',
      }
    }else {
      image = {
        type: 'image',
        originalContentUrl: baseURL + '/static/images/'+hero+'_image.jpg',
        previewImageUrl: baseURL + '/static/images/'+hero+'_image.jpg',
      }
    }
  }
  if(clueCount === 3) {
    music = {
      type: 'audio',
      originalContentUrl: baseURL + 'static/music/'+hero+'join.m4a',
      duration: 15000
    }
  }

  if(image === null) {
    return client.replyMessage(replyToken, [music]);
  }

  return client.replyMessage(replyToken, [music,image]);
}

function handlePostBack(replyToken,data,source) {
  if(data.indexOf("CLUEHERO") > -1) {
    return handleAnswerAndClues(replyToken,data.split("|")[1],source);
  }else if(data.indexOf("ANSWERHERO") > -1) {
    redisClient.set(source.userId+"ANSWERHERO",data);
    return replyText(replyToken, ["Please type your answer!"]);
  }else if (data.indexOf("HEROANSWEREDYES") > -1) {

    redisClient.get(source.userId+"ANSWERHERO",(err,redisData)=> {
      if(redisData){
        
        // save answer to data base
        //update the clue list table of user 
        let player = mongoose.model('players',playerSchema);
        let query = player.find({userId:source.userId});
        return query.exec((err,docs)=> {
          console.log("succesfully query");
          if(docs.length > 0) {
            let teamAnswer = mongoose.model('team_answers',answerSchema);
            let date = new Date();
            return teamAnswer.create({teamName: docs[0].teamName, userId: docs[0].userId,"heroId": redisData.split("|")[0],"heroAnswer":redisData.split("|")[1],"timestamp":date.getMilliseconds()},(err)=> {
              console.log(err);
              return client.replyMessage(replyToken, [
                {
                  "type": "text",
                  "text": "Good Answer! But I am not sure it is correct anyway..."
                },
                {
                  "type": "sticker",
                  "packageId": "1",
                  "stickerId": "10"
                }
              ]);
            });
          }else {
            //error plaer not registered
          }
        });
        
      }
    });

  }else if (data.indexOf("HEROANSWEREDNO") > -1) {
    redisClient.set(source.userId+"ANSWERHERO");
    return client.replyMessage(replyToken, [
      {
        "type": "text",
        "text": "Why?!"
      },
      {
        "type": "sticker",
        "packageId": "1",
        "stickerId": "3"
      }
    ]);
  }else if(data.indexOf("REGISTERTEAM") > -1) {
    return redisClient.get(source.userId+"REGISTERTEAM",(err,teamName)=> {
      if(teamName) {
        console.log("team Name",teamName);
        if(data === 'REGISTERTEAMYES') {

          return client.getProfile(source.userId)
          .then((profile) => {
            let players = mongoose.model('players',playerSchema);
            return players.create({userId: source.userId,userName: profile.displayName,teamName:teamName},(err)=> {
              console.log(err);
              return replyText(replyToken, ["Registration successfull"]);
            });
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



// case 'confirm':
//       return client.replyMessage(
//         replyToken,
//         {
//           type: 'template',
//           altText: 'Confirm alt text',
//           template: {
//             type: 'confirm',
//             text: 'Do it?',
//             actions: [
//               { label: 'Yes', type: 'message', text: 'Yes!' },
//               { label: 'No', type: 'message', text: 'No!' },
//             ],
//           },
//         }
//       )
//     // case 'music':
//     //   return handleAudio(message,replyToken);
//     case 'menu':
//       return client.replyMessage(
//         replyToken,
//         {
//           type: 'template',
//           altText: 'Main Menu',
//           template: {
//             type: 'carousel',
//             columns: [
//               {
//                 thumbnailImageUrl: buttonsImageURL,
//                 title: 'Heroes Quest',
//                 text: 'Finish to quest to find the missing heroes!',
//                 actions: [
//                   { label: 'Start Quest', type: 'postback', data: 'start quest', displayText: 'Start Quest'},
//                 ],
//               },
//               {
//                 thumbnailImageUrl: buttonsImageURL,
//                 title: 'Event Information',
//                 text: 'Discover the fun!',
//                 actions: [
//                   { label: 'Yes, please!', type: 'postback', data: 'event information', displayText: 'Event Information' },
//                 ],
//               },
//             ],
//           },
//         }
//       );
//     case 'image carousel':
//       return client.replyMessage(
//         replyToken,
//         {
//           type: 'template',
//           altText: 'Image carousel alt text',
//           template: {
//             type: 'image_carousel',
//             columns: [
//               {
//                 imageUrl: buttonsImageURL,
//                 action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
//               },
//               {
//                 imageUrl: buttonsImageURL,
//                 action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
//               },
//               {
//                 imageUrl: buttonsImageURL,
//                 action: { label: 'Say message', type: 'message', text: 'Rice=米' },
//               },
//               {
//                 imageUrl: buttonsImageURL,
//                 action: {
//                   label: 'datetime',
//                   type: 'datetimepicker',
//                   data: 'DATETIME',
//                   mode: 'datetime',
//                 },
//               },
//             ]
//           },
//         }
//       );
//     case 'imagemap':
//       return client.replyMessage(
//         replyToken,
//         {
//           type: 'imagemap',
//           baseUrl: `${baseURL}/static/rich`,
//           altText: 'Imagemap alt text',
//           baseSize: { width: 1040, height: 1040 },
//           actions: [
//             { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
//             { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
//             { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
//             { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
//           ],
//         }
//       );
    // case 'delete storage':
    //   storage = [];
    //   return replyText(replyToken, "Storage sudah bersih");
    // case 'list of storage':
    //   if(storage.length == 0)
    //     return replyText(replyToken, "Tidak ada storage");
    //   else
    //     return replyText(replyToken, storage);